# ===== Build assets =====
FROM node:20-alpine AS build
WORKDIR /app

ARG VITE_KAKAOMAP_KEY
ARG VITE_KAKAO_REST_API_KEY
ARG VITE_KAKAO_REDIRECT_URI=https://jw-linkus.com/oauth/kakao/callback
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_REDIRECT_URI=https://jw-linkus.com/oauth/google/callback
ARG VITE_EMAILJS_SERVICE_ID
ARG VITE_EMAILJS_TEMPLATE_ID
ARG VITE_EMAILJS_PUBLIC_KEY

ENV VITE_KAKAOMAP_KEY=$VITE_KAKAOMAP_KEY \
    VITE_KAKAO_REST_API_KEY=$VITE_KAKAO_REST_API_KEY \
    VITE_KAKAO_REDIRECT_URI=$VITE_KAKAO_REDIRECT_URI \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_GOOGLE_REDIRECT_URI=$VITE_GOOGLE_REDIRECT_URI \
    VITE_EMAILJS_SERVICE_ID=$VITE_EMAILJS_SERVICE_ID \
    VITE_EMAILJS_TEMPLATE_ID=$VITE_EMAILJS_TEMPLATE_ID \
    VITE_EMAILJS_PUBLIC_KEY=$VITE_EMAILJS_PUBLIC_KEY

COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ===== Nginx serve =====
FROM nginx:1.27-alpine
# default.conf로 copy하면 알아서 덮어써짐, nginx.conf의 이름은 꼭 nginx-conf.conf일 필요는 없음. 확장자만 맞으면 됨
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
