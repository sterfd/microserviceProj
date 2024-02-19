echo $REGISTRY_UN
echo $REGISTRY_PW
echo $secrets.KUBE_CONFIG

envsubst < ./scripts/kubernetes/deploy.yaml | kubectl apply -f -