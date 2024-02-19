echo $CONTAINER_REGISTRY
echo $VERSION
docker build -t $CONTAINER_REGISTRY/video-streaming:$VERSION --file ./Dockerfile-prod .