# extendo-wrap-lambda
Wrap user images in Lambda runtime client



docker build -t wrapped --build-arg NESTED_CMD_LINE="node /mermaid.js" --build-arg BASE_IMAGE=mermaid .
docker run -it -v c:\temp\tmp:/tmp/test --entrypoint bash wrapped   