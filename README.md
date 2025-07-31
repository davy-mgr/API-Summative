Earthquake Alert Notifier
Overview

Earthquake Alert Notifier is a containerized web application that allows users to monitor real-time earthquake activity using configurable input such as magnitude, geographic coordinates, and search radius. The application fetches data from a public earthquake API and notifies users through browser alerts.
Features

    Live earthquake monitoring based on user-defined criteria.

    Display of recent earthquakes with details like location, magnitude, and time.

    Browser notifications for new events.

    Clean, responsive UI built with plain HTML, CSS, and JavaScript.

API Used

This app uses the USGS Earthquake API to query recent seismic activity.
The frontend uses JavaScript’s fetch() to call the API and extract earthquakes that match:

    Minimum magnitude

    Latitude and longitude

    Radius (in kilometers)

    Start time (default: last minute)

API data is returned in GeoJSON format and parsed in app.js.
Deployment Architecture

This application is containerized and can be deployed on multiple hosts with load balancing:

    Web Server Nodes (web01, web02, etc.): Run individual app containers.

    Load Balancer (lb01): HAProxy routes incoming traffic to the app instances.

Running the App with Docker
1. Create Dockerfile

Place this in a file named Dockerfile alongside your app files:

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY index.html /usr/share/nginx/html/
COPY style.css /usr/share/nginx/html/
COPY app.js /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

2. Build the Docker Image

docker build -t earthquake-notifier .

3. Run the Container

docker run -d --name earthquake-app -p 8080:80 earthquake-notifier

Pushing to Docker Hub (Optional)

If desired, tag your image and push it to Docker Hub:

docker tag earthquake-notifier yourusername/earthquake-notifier:latest
docker push yourusername/earthquake-notifier:latest

Load Balancing with HAProxy

To enable high availability, deploy your app on multiple Docker nodes and route traffic through a load balancer.
Sample HAProxy Configuration (haproxy.cfg):

frontend http-in
    bind *:8080
    default_backend webapps

backend webapps
    balance roundrobin
    server web01 192.168.0.11:8080 check
    server web02 192.168.0.12:8080 check

    Replace IP addresses with your actual container or VM IPs.

    Ensure each web node is running the container and exposed on the correct port.

Reload HAProxy:

docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /usr/local/etc/haproxy/haproxy.cfg'

Testing Load Balancing

From your load balancer node or host:

curl http://localhost:8080

Repeat multiple times — responses should alternate between web servers.
