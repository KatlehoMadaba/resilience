"use client";
import { getAxiosInstance } from "../../utils/axiosInstance";
import { IUser } from "./models";
import { INITIAL_STATE, UserActionContext, UserStateContext } from "./context";
import { UserReducer } from "./reducer";
import { useContext, useReducer } from "react";
import {
  getUserError,
  getUserPending,
  getUserSuccess,
  getCurrentUserPending,
  getCurrentUserSuccess,
  getCurrentUserError,
  getCurrentPersonIdPending,
  getCurrentPersonIdError,
  getCurrentPersonIdSuccess,
  createUserSuccess,
  createUserError,
  createUserPending,
  updateUserPending,
  updateUserSuccess,
  updateUserError,
  deleteUserSuccess,
  deleteUserError,
  deleteUserPending,
} from "./actions";
import axios from "axios";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(UserReducer, INITIAL_STATE);
  const instance = getAxiosInstance();

  // useEffect(() => {
  //   const load = async () => {
  //     const personId = await getMyPersonId();
  //     getUser((prev) => ({ ...prev, personId }));
  //   };

  //   if (getCurrentUser?.id && !user.personId) {
  //     load();
  //   }
  // }, [loggedInUser]);
  // Get current user
  const getCurrentUser = async (): Promise<IUser | null> => {
    dispatch(getCurrentUserPending());
    const endpoint = `/api/services/app/Session/GetCurrentLoginInformations`;
    return instance
      .get(endpoint)
      .then((response) => {
        if (response?.data?.result) {
          dispatch(getCurrentUserSuccess(response?.data?.result?.user));
          return response?.data?.result?.user;
        } else {
          console.warn("No user data found in response");
          dispatch(getCurrentUserError());
          return null;
        }
      })
      .catch((error) => {
        console.error("Error fetching current user:", error);
        dispatch(getCurrentUserError());
        return null;
      });
  };

  const getCurrentPersonId = async () => {
    const endpoint = `/api/services/app/PersonService/GetCurrentPersonId`;
    dispatch(getCurrentPersonIdPending());
    instance
      .get(endpoint)
      .then((response) => {
        dispatch(getCurrentPersonIdSuccess(response?.data?.result));
      })
      .catch((error) => {
        console.error("Error while getting current Person:", error);
        dispatch(getCurrentPersonIdError());
      });
  };

  // Fetch all users
  const getUsers = async () => {
    dispatch(getUserPending());
    const endpoint = `/api/services/app/User/GetAll`;
    return instance
      .get(endpoint)
      .then((response) => {
        dispatch(getUserSuccess(response?.data?.result ?? []));
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        dispatch(getUserError());
      });
  };

  // Create a user
  const createUser = async (user: IUser) => {
    dispatch(createUserPending());
    const endpoint = `/api/services/app/User/Create`;

    return instance
      .post(endpoint, user)
      .then((response) => {
        dispatch(createUserSuccess(response?.data?.result));
      })
      .catch((error) => {
        console.error("Error creating user:", error);
        dispatch(createUserError());
      });
  };

  // Update a user
  const updateUser = async (user: IUser) => {
    dispatch(updateUserPending());
    const endpoint = `/api/services/app/User/Update`;

    return instance
      .put(endpoint, user)
      .then((response) => {
        dispatch(updateUserSuccess(response?.data?.result));
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        dispatch(updateUserError());
      });
  };

  // Delete a user
  const deleteUser = (id: string) => {
    dispatch(deleteUserPending());
    const endpoint = `/api/services/app/User/Delete?input=${id}`;

    return instance
      .delete(endpoint)
      .then((response) => {
        dispatch(deleteUserSuccess(response?.data?.result));
      })
      .catch((error) => {
        console.error("Error deleting user:", error);
        dispatch(deleteUserError());
      });
  };

  // Get a specific user
  const getUser = async (id: string) => {
    dispatch(getUserPending());
    const endpoint = `/api/services/app/User/Get?input=${id}`;
    return axios
      .get(endpoint)
      .then((response) => {
        dispatch(getUserSuccess(response?.data?.result));
      })
      .catch((error) => {
        console.error("Error fetching user:", error);
        dispatch(getUserError());
      });
  };

  return (
    <UserStateContext.Provider value={state}>
      <UserActionContext.Provider
        value={{
          getUsers,
          createUser,
          updateUser,
          deleteUser,
          getCurrentUser,
          getCurrentPersonId,
          getUser,
        }}
      >
        {children}
      </UserActionContext.Provider>
    </UserStateContext.Provider>
  );
};

// Hook for user state
export const useUserState = () => {
  const context = useContext(UserStateContext);
  if (!context) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
};

// Hook for user actions
export const useUserActions = () => {
  const context = useContext(UserActionContext);
  if (!context) {
    throw new Error("useUserActions must be used within a UserProvider");
  }
  return context;
};
