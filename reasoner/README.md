# A-Solid Reasoner

This is the reasoner setup for A-Solid project, for running the [EyeServer](https://github.com/eyereasoner/EyeServer), consisting of:

* Dockerfile from [EyeServer](https://github.com/eyereasoner/EyeServer)
* A script for bulding the Docker image as `a-solid/eyeserver:latest`
* A script and the corresponding Docker Compose file for running the built image


## Dependencies

* Docker
* Docker Compose

## Usage

The Docker image can be built with the included script:

    yarn run build

And then started:

    yarn run start

After starting, the image should work for reasoning requests:

    curl "http://localhost:8000/?data=https://n3.restdesc.org/n3/friends.n3&data=https://n3.restdesc.org/n3/knows-rule.n3&query=https://n3.restdesc.org/n3/query-all.n3"

## Network Access

When network access has not been set up for Docker, it might be necessary to specify host networking mode. This can be done by:
* Uncommenting the following line in `compose.yaml`: `#network_mode: host`
* Adding the following flag to the `start` script in `package.json`: `--network host`
