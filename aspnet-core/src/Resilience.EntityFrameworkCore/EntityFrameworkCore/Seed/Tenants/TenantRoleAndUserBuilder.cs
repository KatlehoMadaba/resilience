﻿using Abp.Authorization;
using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.MultiTenancy;
using Resilience.Authorization;
using Resilience.Authorization.Roles;
using Resilience.Authorization.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Linq;

namespace Resilience.EntityFrameworkCore.Seed.Tenants;

public class TenantRoleAndUserBuilder
{
    private readonly ResilienceDbContext _context;
    private readonly int _tenantId;

    public TenantRoleAndUserBuilder(ResilienceDbContext context, int tenantId)
    {
        _context = context;
        _tenantId = tenantId;
    }

    public void Create()
    {
        CreateRolesAndUsers();
    }

    private void CreateRolesAndUsers()
    {
        // Admin role

        var adminRole = _context.Roles.IgnoreQueryFilters().FirstOrDefault(r => r.TenantId == _tenantId && r.Name == StaticRoleNames.Tenants.Admin);
        if (adminRole == null)
        {
            adminRole = _context.Roles.Add(new Role(_tenantId, StaticRoleNames.Tenants.Admin, StaticRoleNames.Tenants.Admin) { IsStatic = true }).Entity;
            _context.SaveChanges();
        }

        // Grant all permissions to admin role

        var grantedPermissions = _context.Permissions.IgnoreQueryFilters()
            .OfType<RolePermissionSetting>()
            .Where(p => p.TenantId == _tenantId && p.RoleId == adminRole.Id)
            .Select(p => p.Name)
            .ToList();

        var permissions = PermissionFinder
            .GetAllPermissions(new ResilienceAuthorizationProvider())
            .Where(p => p.MultiTenancySides.HasFlag(MultiTenancySides.Tenant) &&
                        !grantedPermissions.Contains(p.Name))
            .ToList();

        if (permissions.Any())
        {
            _context.Permissions.AddRange(
                permissions.Select(permission => new RolePermissionSetting
                {
                    TenantId = _tenantId,
                    Name = permission.Name,
                    IsGranted = true,
                    RoleId = adminRole.Id
                })
            );
            _context.SaveChanges();
        }

        // Admin user

        var adminUser = _context.Users.IgnoreQueryFilters().FirstOrDefault(u => u.TenantId == _tenantId && u.UserName == AbpUserBase.AdminUserName);
        if (adminUser == null)
        {
            adminUser = User.CreateTenantAdminUser(_tenantId, "admin@defaulttenant.com");
            adminUser.Password = new PasswordHasher<User>(new OptionsWrapper<PasswordHasherOptions>(new PasswordHasherOptions())).HashPassword(adminUser, "123qwe");
            adminUser.IsEmailConfirmed = true;
            adminUser.IsActive = true;

            var otherUser = User.CreateTenantAdminUser(_tenantId, "admin@madaba.com");
            otherUser.UserName = "kat";
            otherUser.Password = new PasswordHasher<User>(new OptionsWrapper<PasswordHasherOptions>(new PasswordHasherOptions())).HashPassword(otherUser, "123qwe");
            otherUser.IsEmailConfirmed = true;
            otherUser.IsActive = true;

            _context.Users.Add(adminUser);
            _context.Users.Add(otherUser);
            _context.SaveChanges();

            // Assign Admin role to admin user
            _context.UserRoles.Add(new UserRole(_tenantId, adminUser.Id, adminRole.Id));
            _context.UserRoles.Add(new UserRole(_tenantId, otherUser.Id, adminRole.Id));
            _context.SaveChanges();
        }
    }
}
