﻿
using Abp.Dependency;
using Abp.Domain.Repositories;
using Newtonsoft.Json;
using Resilience.Domain.Medical_AssistanceRecords;
using Resilience.ExternalServices.GooglePlaces;

using System;
using System.Net.Http;
using System.Threading.Tasks;

namespace Resilience.EntityFrameworkCore.Seed
{
    public class MedicalFacilitySeeder : ITransientDependency
    {
        private readonly IRepository<MedicalFacility, Guid> _medicalFacilityRepository;
        private readonly IHttpClientFactory _httpClientFactory;

        public MedicalFacilitySeeder(IRepository<MedicalFacility, Guid> medicalFacilityRepository, IHttpClientFactory httpClientFactory)
        {
            _medicalFacilityRepository = medicalFacilityRepository;
            _httpClientFactory = httpClientFactory;
        }

        public async Task SeedAsync()
        {
            string apiKey = "AIzaSyAMGW5ic5jY_AT4bPE3N915OtPZbkhSIc4";
            string[] searchTerms = new[]
            {
                "hospitals in Gauteng",
                "clinics in Gauteng",
                "medical centers in Gauteng",
                "urgent care in Gauteng",
                "health facilities in Gauteng",
                "rape crisis centers in Gauteng",
                "sexual assault support in Gauteng",
                "gender-based violence shelters in Gauteng",
                "trauma counseling centers in Gauteng"
            };

            var client = _httpClientFactory.CreateClient();

            foreach (var term in searchTerms)
            {
                string searchUrl = $"https://maps.googleapis.com/maps/api/place/textsearch/json?query={Uri.EscapeDataString(term)}&key={apiKey}";
                var response = await client.GetAsync(searchUrl);
                var json = await response.Content.ReadAsStringAsync();
                var result = JsonConvert.DeserializeObject<GooglePlacesResponse>(json);

                if (result?.results == null) continue;

                foreach (var place in result.results)
                {
                    var exists = await _medicalFacilityRepository.FirstOrDefaultAsync(x => x.PlaceId == place.place_id);
                    if (exists != null) continue;

                    string placeId = place.place_id;
                    string mapsUrl = $"https://www.google.com/maps/place/?q=place_id:{placeId}";
                    string detailsUrl = $"https://maps.googleapis.com/maps/api/place/details/json?place_id={placeId}&key={apiKey}";

                    var detailsResponse = await client.GetAsync(detailsUrl);
                    var detailsJson = await detailsResponse.Content.ReadAsStringAsync();
                    var detailsResult = JsonConvert.DeserializeObject<GooglePlaceDetailsResponse>(detailsJson);

                    bool isCrisisCenter = place.name.ToLower().Contains("crisis")
                                       || place.name.ToLower().Contains("rape")
                                       || place.name.ToLower().Contains("support")
                                       || place.name.ToLower().Contains("trauma");

                    var facility = new MedicalFacility
                    {
                        Id = Guid.NewGuid(),
                        Name = place.name,
                        Address = place.formatted_address,
                        Latitude = place.geometry.location.lat,
                        Longitude = place.geometry.location.lng,
                        PlaceId = placeId,
                        GoogleMapsUrl = mapsUrl,
                        PhoneNumber = detailsResult.result?.formatted_phone_number,
                        OperatingHours = detailsResult.result?.opening_hours != null
                            ? string.Join("; ", detailsResult.result.opening_hours.weekday_text)
                            : null,
                        HasRapeKit = isCrisisCenter,
                        SupportAllGenders = isCrisisCenter
                    };

                    await _medicalFacilityRepository.InsertAsync(facility);
                }
            }
        }
    }

}