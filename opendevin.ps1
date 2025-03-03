
# Public
#docker run -it --pull=always -e SANDBOX_USER_ID=$(id -u) -e PERSIST_SANDBOX="true" -e SSH_PASSWORD="changeit" -e WORKSPACE_MOUNT_PATH=${PWD} -v ${PWD}:/opt/workspace_base -v ${PWD}/.hub:/home/enduser/.cache/huggingface/hub -v /var/run/docker.sock:/var/run/docker.sock -p 5001:3000 --add-host host.docker.internal:host-gateway --name opendevin-app-$(date +%Y%m%d%H%M%S) ghcr.io/opendevin/opendevin:0.6

# Local
docker run -it --pull=always -e SANDBOX_USER_ID=$(id -u) -e WORKSPACE_DIR="./workspace" -e LLM_EMBEDDING_MODEL="local" -e LLM_API_KEY="ollama" -e LLM_BASE_URL="http://host.docker.internal:11434" -e PERSIST_SANDBOX="true" -e SSH_PASSWORD="changeit" -e WORKSPACE_MOUNT_PATH=${PWD} -v ${PWD}:/opt/workspace_base -v ${PWD}/.hub:/home/enduser/.cache/huggingface/hub -v /var/run/docker.sock:/var/run/docker.sock -p 5001:3000 --add-host host.docker.internal:host-gateway --name opendevin-app-$(date +%Y%m%d%H%M%S) ghcr.io/opendevin/opendevin:0.6

