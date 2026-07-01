import { create } from "zustand";
// 저장된 state를 클래스 접근자 비슷하게 사용하기 위해 필요
import { immer } from "zustand/middleware/immer";

const useChatStore = create(
  immer((set) => ({
    // 채팅 리스트에 표시할 채팅(기존 채팅 + axios로 받아오는 채팅)
    chatList: [],

    // 맵에 표시할 채팅(axios로 받아오는 채팅리스트만 저장)
    mapChat: [],

    // 챗 리스트 새로운 채팅 추가
    addChat: (item) => {
      set((state) => {
        const idx = state.chatList.findIndex((x) => x.chatId === item.chatId);
        if (idx !== -1) {
          state.chatList[idx] = {
            ...state.chatList[idx],
            ...item,
          };
          return;
        }
        state.chatList.push(item);
      });
    },

    // 채팅 삭제
    removeChat: (id) => {
      set((state) => {
        const idx = state.chatList.findIndex((x) => x.chatId === id);
        if (idx !== -1) state.chatList.splice(idx, 1);
      });
    },

    // 채팅 정렬
    sortChat: () => {
      set((state) => {
        // createdAt 기준 오름차순
        state.chatList.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
      });
    },

    // mapChat 업데이트
    updateUserChatCustom: (userId, chatCustom) => {
      set((state) => {
        state.chatList.forEach((chat) => {
          if (chat.userId === userId) {
            chat.chatCustom = chatCustom;
          }
        });

        state.mapChat.forEach((chat) => {
          if (chat.userId === userId) {
            chat.chatCustom = chatCustom;
          }
        });
      });
    },

    refreshMapChat: (item) => {
      set((state) => {
        state.mapChat = item;
        item.forEach((chat) => {
          const idx = state.chatList.findIndex(
            (x) => x.chatId === chat.chatId,
          );

          if (idx !== -1) {
            state.chatList[idx] = {
              ...state.chatList[idx],
              ...chat,
            };
            return;
          }

          state.chatList.push(chat);
        });

        state.chatList.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        );
      });
    },
  })),
);

export default useChatStore;
