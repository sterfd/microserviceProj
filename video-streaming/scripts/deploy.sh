echo $REGISTRY_UN
echo $REGISTRY_PW
echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig

envsubst < ./scripts/kubernetes/deploy.yaml | kubectl apply -f -