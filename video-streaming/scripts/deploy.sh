echo $REGISTRY_UN
echo $REGISTRY_PW
echo $CONTAINER_REGISTRY
echo $VERSION
echo $KUBE_CONFIG

envsubst < ./scripts/kubernetes/deploy.yaml | kubectl apply -f -