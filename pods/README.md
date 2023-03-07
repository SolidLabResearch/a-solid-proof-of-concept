# A-Solid Pods

The repository here contains the [Docker Compose](https://docs.docker.com/compose/) configuration for serving the three different pods required for the project:

* Company pod at [pods/company](pods/company/)
* Government pod at [pods/government](pods/government/)
* Citizen pod at [pods/citizen](pods/citizen/)

The pods are served with the [Community Solid Server docker image](https://hub.docker.com/r/solidproject/community-server), and the compose configuration by default directs the server to register the accounts from [config/default.json](config/default.json), that correspond to the template pods. The pods contain the template data for the demo already.

## Requirements

* Docker
* Docker Compose

## Usage

The provided scripts allow resetting pods to their Git state:

    yarn run reset

And starting the CSS Docker image to serve the pods:

    yarn run start

To check whether the content is being served, it is possible to fetch one of the WebIDs, for example for the citizen:

    curl http://localhost:3000/webid/citizen#me


## Notes

* The paths within the Docker Compose configuration files are relative to the configuration file itself, not the current working directory, apparently.
* If changing the port of the Docker image in the compose file, make sure to also update any ACLs inside the template data in pods folder, because the WebID IRIs include the port number for the localhost WebIDs registered via and served through the CSS.
* Please make sure the permissions for Docker are correctly configured for the current user, and keep in mind the security implications of adding a user to the Docker group, in case they can run Docker images with root permissions.
