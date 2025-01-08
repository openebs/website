---
title: A hands on demo of Volume Populator using OpenEBS LVM CSI driver
author: Shovan Maity
author_info: Shovan works as a Software Engineer at MayaData, who's experienced in Load Balancer, gRPC, WebSocket, REST APIs, and has good hands-on experience on Kubernetes. In his free time, Shovan likes to read blogs on distributed systems. He also likes Travelling and Photography.
date: 05-07-2021
tags: OpenEBS, LVM CSI driver
excerpt: In this blog we will write a volume populator and create a volume with that populator. This is written using lib-volume-populator. This is a control loop on PVC that maintains the lifecycle of the PV and PVC for volume populator.
---

In this blog we will write a volume populator and create a volume with that populator. Source code of this volume populator is available [here](https://github.com/shovanmaity/s3-populator). This is written using [lib-volume-populator](https://github.com/kubernetes-csi/lib-volume-populator). This is a control loop on PVC that maintains the lifecycle of the PV and PVC for volume populator. If we want to write a volume populator we need to write a CRD spec like [this](https://github.com/shovanmaity/s3-populator/blob/main/types.go) and we need to code on how to write the data on the volume. We can build or reuse any plugin that can write data from source to the volume. Here we will use [s3 sync](https://github.com/shovanmaity/s3-sync) image to write data from s3 to local volume. This can copy data from a bucket or a particular directory in a bucket. This may have some other use cases. In this example we will create, build a react app, push it to MinIo and then we will use that s3 bucket to create volumes for nginx instances.

In this exercise we will use the OpenEBS LVM CSI driver though it will work with any CSI driver and we will perform this demo in a local minikube cluster. The steps are given below.  

*   Create a minikube cluster with AnyVolumeDataSource alpha feature enabled mode.
    
    ```
    minikube start --feature-gates=AnyVolumeDataSource=true
    ```

*   Install OpenEBS LVM CSI driver.
    
    ```
    kubectl apply -f https://raw.githubusercontent.com/openebs/charts/gh-pages/lvm-operator.yaml
    ```

*   Create PV and VG in the host machine.
    
    ```
    truncate -s 10G /tmp/disk.img
    sudo losetup -f /tmp/disk.img --show
    #get loop device id and replace X with it
    sudo pvcreate /dev/loopX
    sudo vgcreate lvmvg /dev/loopX
    ```

*   Create a storage class to create lvm volumes using this volume group.

    ```    
    kubectl create -f - << EOF
    apiVersion: storage.k8s.io/v1
    kind: StorageClass
    metadata:
      name: openebs-lvmpv
    parameters:
      storage: lvm
      volgroup: lvmvg
    provisioner: local.csi.openebs.io
    EOF
    ```

*   Install volume populator controller.

    ```    
    kubectl apply -f https://raw.githubusercontent.com/shovanmaity/s3-populator/main/crd.yaml
    kubectl apply -f https://raw.githubusercontent.com/shovanmaity/s3-populator/main/deploy.yaml
    ```

*   Run MinIO on the local machine as a S3 source.

    ```
    docker run -p 9000:9000 \
      -e "MINIO_ROOT_USER=minioadmin" \
      -e "MINIO_ROOT_PASSWORD=minioadmin" \
      minio/minio server /data
    ```

*   Create and build a react app in local machine.
    
    ```
    npx create-react-app my-app
    cd my-app
    npm build
    ```

*   Create a S3 bucket to push the static files.
    
    ```
    AWS_ACCESS_KEY_ID=minioadmin \
    AWS_SECRET_ACCESS_KEY=minioadmin \
    AWS_REGION=us-east-1 \
    aws --endpoint-url http://192.168.0.190:9000 s3api create-bucket --bucket my-bucket
    ```

*   Make sure we are inside the build folder of the react app and then push the static files to s3.
    
    ```
    AWS_ACCESS_KEY_ID=minioadmin \
    AWS_SECRET_ACCESS_KEY=minioadmin \
    AWS_REGION=us-east-1 \
    aws --endpoint-url http://192.168.0.190:9000 s3 cp . s3://my-bucket --recursive
    ```

*   Create a S3 populator cr with S3 and bucket related information.

    ```
    kubectl create -f - << EOF
    apiVersion: example.io/v1
    kind: S3Populator
    metadata:
      name: s3-populator-1
      namespace: default
    spec:
      url: http://192.168.0.190:9000
      id: minioadmin
      secret: minioadmin
      region: us-east-1
      bucket: my-bucket
      key: /
    EOF
    ```

*   Create a nginx service to access it.
    
    ```
    kubectl create -f - << EOF
    apiVersion: v1
    kind: Service
    metadata:
      name: nginx
      namespace: default
      labels:
        app: nginx
    spec:
      ports:
      - port: 80
        name: web
      type: NodePort
      selector:
        app: nginx
    EOF
    ```

*   Create a nginx sts.
    
    ```
    kubectl create -f - << EOF
    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: web
      namespace: default
    spec:
      serviceName: nginx
      replicas: 1
      selector:
        matchLabels:
          app: nginx
      template:
        metadata:
          labels:
            app: nginx
        spec:
          containers:
          - name: nginx
            image: registry.k8s.io/nginx-slim:0.8
            ports:
            - containerPort: 80
              name: web
            volumeMounts:
            - name: www
              mountPath: /usr/share/nginx/html
      volumeClaimTemplates:
      - metadata:
          name: www
        spec:
          dataSource:
            apiGroup: example.io
            kind: S3Populator
            name: s3-populator-1
          storageClassName: "openebs-lvmpv"
          accessModes: [ "ReadWriteOnce" ]
          resources:
            requests:
              storage: 500Mi
    EOF
    ```

*   Get the service IP and port and open it in any browser. We will be able to see the same content(react app) in our nginx app.

Please join our community if you have any feedback or queries on the above demo and OpenEBS.