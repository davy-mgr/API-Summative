Deployment Using Docker Playground

To simulate a realistic deployment environment with multiple servers, I used Docker Playground, which provides temporary cloud-based Docker virtual machines. This allowed me to set up and test the application across a basic three-node infrastructure.
Infrastructure Overview

The deployment environment consists of the following three nodes:

    web-01: Runs one instance of the containerized application.

    web-02: Runs a second instance of the same application.

    lb-01: Acts as a load balancer, using HAProxy to distribute traffic between web-01 and web-02.

Each node is a separate instance within Docker Playground and is connected through a private network, allowing internal IP-based communication between the containers.
Application Deployment on web-01 and web-02

On both web-01 and web-02, I performed the following steps:

    Pulled the Docker image from Docker Hub:

docker pull davymgr1/earthquake-noifier:v1

Started the application container on each node:

docker run -d --name earthquake-app -p 8080:80 davymgr1/earthquake-noifier:v1

Modified the index.html file within each container to identify which node was serving the content. This was done to visually confirm that HAProxy was properly distributing traffic:

    On web-01:

docker exec -it earthquake-app sh -c 'echo "<h1>Served by WEB-01</h1>" >> /usr/share/nginx/html/index.html'

On web-02:

        docker exec -it earthquake-app sh -c 'echo "<h1>Served by WEB-02</h1>" >> /usr/share/nginx/html/index.html'

Each container successfully served the modified HTML file on port 8080, confirming they were running independently.
HAProxy Setup on lb-01

On the lb-01 node, I installed and configured HAProxy to act as a load balancer.

    Installed HAProxy (on Alpine-based instances):

apk add haproxy

Created the HAProxy configuration file (haproxy.cfg) with the following contents:

global
    daemon
    maxconn 256

defaults
    mode http
    timeout connect 5000ms
    timeout client  50000ms
    timeout server  50000ms

frontend http-in
    bind *:80
    default_backend webapps

backend webapps
    balance roundrobin
    server web01 192.168.0.29:8080 check
    server web02 192.168.0.30:8080 check

    Note: The IP addresses (192.168.0.29, 192.168.0.30) were obtained by running ip addr show eth0 on each web node and identifying their private network IPs.

Launched HAProxy using the custom configuration:

    haproxy -f haproxy.cfg

Testing the Load Balancer

To verify the configuration, I sent multiple HTTP requests from the lb-01 node using curl:

curl http://localhost

The responses alternated between the modified HTML from web-01 and web-02, confirming that HAProxy was successfully load balancing traffic between both instances using the round-robin method.
