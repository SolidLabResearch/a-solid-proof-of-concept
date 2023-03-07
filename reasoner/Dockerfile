# This Dockerfile is a slightly modified version of the EyeServer one:
# https://github.com/eyereasoner/EyeServer

# When the EyeServer repository gets a workflow to build and publish the image,
# this repository should be changed to use that image instead, and this Dockerfile
# deleted as unnecessary.

FROM eyereasoner/eye:latest
LABEL maintainer="https://github.com/eyereasoner/"

RUN apt -qq update && \
	apt install -qy --no-install-recommends nodejs npm && \
	apt -qy autoremove && \
	apt clean && \
	rm -rf /var/lib/apt/lists/*

RUN npm -g install eyeserver

EXPOSE 8000
ENTRYPOINT ["eyeserver"]
