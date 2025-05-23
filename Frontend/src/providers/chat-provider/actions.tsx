"use client";
import { createAction } from "redux-actions";
import { IChatMessageStateContext } from "./context";
import { ISendMessage, IChatMessage } from "./models";

// Enum defining the actions for creating a ChatMessage
export enum ChatMessageActionEnums {
  sendMessagePending = "CREATE_ChatMessage_PENDING",
  sendMessageSuccess = "CREATE_ChatMessage_SUCCESS",
  sendMessageError = "CREATE_ChatMessage_ERROR",
  getMessagesWithPersonPending = "GET_ChatMessages_PENDING",
  getMessagesWithPersonSuccess = "GET_ChatMessages_SUCCESS",
  getMessagesWithPersonError = "GET_ChatMessages_ERROR",
  addMessagePending = "CREATE_addMessage_PENDING",
  addMessageSuccess = "CREATE_addMessage_SUCCESS",
  addMessageError = "CREATE_addMessage_ERROR",
  countMessagesPending = "COUNT_Messages_PENDING",
  countMessagesError = "COUNT_Messages_ERROR",
  countMessagesSuccess = "COUNT_Messages_SUCCESS",
}

// CREATE ChatMessage ACTIONS
export const sendMessagePending = createAction<IChatMessageStateContext>(
  ChatMessageActionEnums.sendMessagePending,
  () => ({ isPending: true, isSuccess: false, isError: false })
);

export const sendMessageSuccess = createAction<
  IChatMessageStateContext,
  ISendMessage
>(ChatMessageActionEnums.sendMessageSuccess, (sendMessage: ISendMessage) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  sendMessage,
}));

export const sendMessageError = createAction<IChatMessageStateContext>(
  ChatMessageActionEnums.sendMessageError,
  () => ({ isPending: false, isSuccess: false, isError: true })
);
export const getMessagesWithPersonPending =
  createAction<IChatMessageStateContext>(
    ChatMessageActionEnums.sendMessagePending,
    () => ({ isPending: true, isSuccess: false, isError: false })
  );

export const getMessagesWithPersonSuccess = createAction<
  IChatMessageStateContext,
  IChatMessage[]
>(
  ChatMessageActionEnums.getMessagesWithPersonSuccess,
  (ChatMessages: IChatMessage[]) => ({
    isPending: false,
    isSuccess: true,
    isError: false,
    ChatMessages,
  })
);

export const getMessagesWithPersonError =
  createAction<IChatMessageStateContext>(
    ChatMessageActionEnums.sendMessageError,
    () => ({ isPending: false, isSuccess: false, isError: true })
  );

export const countMessagesPending = createAction<IChatMessageStateContext>(
  ChatMessageActionEnums.sendMessagePending,
  () => ({ isPending: true, isSuccess: false, isError: false })
);

export const countMessagesSuccess = createAction<
  IChatMessageStateContext,
  number
>(ChatMessageActionEnums.countMessagesSuccess, (CountMessages: number) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  CountMessages,
}));

//add message
export const addMessagePending = createAction<IChatMessageStateContext>(
  ChatMessageActionEnums.sendMessagePending,
  () => ({ isPending: true, isSuccess: false, isError: false })
);
export const addMessageSuccess = createAction<
  IChatMessageStateContext,
  IChatMessage
>(ChatMessageActionEnums.sendMessageSuccess, (message: IChatMessage) => ({
  isPending: false,
  isSuccess: true,
  isError: false,
  message,
}));

export const addMessageError = createAction<IChatMessageStateContext>(
  ChatMessageActionEnums.sendMessageError,
  () => ({ isPending: false, isSuccess: false, isError: true })
);

// export const addMessage = (message: IChatMessage) => ({
//   type: "ADD_MESSAGE",
//   payload: message,
// });
