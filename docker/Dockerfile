# start image for build
FROM node:latest as build
# copy files for build
COPY . /build
WORKDIR /build
# install angular & application deps
RUN npm install -g @angular/cli
RUN npm install
# build
RUN ng build --prod

# start clean image
FROM nginx:latest
# copy nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/
# remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
# copy dist files
COPY --from=build /build/dist/TEXTA /usr/share/nginx/html
