# extendo-wrap-lambda
Wrap user images in Lambda runtime client

This should use at most Node 10.* capabilities as that's whats common on current base images (e.g., Buster)


```
docker build -t wrapped --build-arg NESTED_CMD_LINE="node /mermaid.js" --build-arg BASE_IMAGE=mermaid .
docker run -it -v c:\temp\tmp:/tmp/test --entrypoint bash wrapped   

docker build -t wj --build-arg NESTED_CMD_LINE="node /jupyter.js" --build-arg BASE_IMAGE=nb .
docker run -v c:\temp\tmp:/tmp/extendo-compute wj
```