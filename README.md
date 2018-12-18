# kube-dingtalk

kube-dingtalk is a monitoring service for Kubernetes. When a pod has failed,
it will publish a message in DingDing channel.


## Installation

1. Create the dingding robot webhook.
2. Use the dockerfile build container image in your project.
3. (optional) If your kubernetes uses RBAC, you should apply the following manifest as well:
```yml
---
kind: ClusterRole
apiVersion: rbac.authorization.k8s.io/v1
metadata:
  name: kube-dingtalk
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "watch", "list"]
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: kube-dingtalk
  namespace: kube-system
---
apiVersion: rbac.authorization.k8s.io/v1beta1
kind: ClusterRoleBinding
metadata:
  name: kube-dingtalk
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: kube-dingtalk
subjects:
  - kind: ServiceAccount
    name: kube-dingtalk
    namespace: kube-system
  ```
Load this Deployment into your Kubernetes. Make sure you set `DINGTALK_TOKEN` to the Webhook URL and uncomment serviceAccountName if you use RBAC

```yml
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: kube-dingtalk
  namespace: kube-system
spec:
  replicas: 1
  revisionHistoryLimit: 3
  template:
    metadata:
      annotations:
        scheduler.alpha.kubernetes.io/critical-pod: ""
      name: kube-dingtalk
      labels:
        app: kube-dingtalk
    spec:
     # Uncomment serviceAccountName if you use RBAC.
      serviceAccountName: kube-dingtalk
      containers:
      - name: kube-dingtalk
        image: kube-dingtalk:v1  # Use the dockerfile build image in your project 
        env:
        - name: DINGTALK_TOKEN
          value: xxxxxxxxxxxxx
        #- name: TICK_RATE
        #  value: "60000"
        - name: FLOOD_EXPIRE
          value: "120000"
        - name: NOT_READY_MIN_TIME
          value: "120000"
        #- name: KUBE_NAMESPACES_ONLY
        #  value: kube-system
        resources:
          requests:
            memory: 30M
            cpu: 5m
      tolerations:
      - effect: NoSchedule
        key: node-role.kubernetes.io/master
      - key: CriticalAddonsOnly
        operator: Exists
```

4. To test, try creating a failing pod. The bot should announce in the channel after 15s with the status `ErrImagePull`. Example of failing image:

```yml
apiVersion: v1
kind: Pod
metadata:
  name: kube-slack-test
spec:
  containers:
  - image: willwill/inexisting
    name: kube-slack-test
```

Additionally, the following environment variables can be used:

- `TICK_RATE`: How often to update in milliseconds. (Default to 15000 or 15s)
- `FLOOD_EXPIRE`: Repeat notification after this many milliseconds has passed after status returned to normal. (Default to 60000 or 60s)
- `NOT_READY_MIN_TIME`: Time to wait after pod become not ready before notifying. (Default to 60000 or 60s)
- `KUBE_USE_KUBECONFIG`: Read Kubernetes credentials from active context in ~/.kube/config (default off)
- `KUBE_USE_CLUSTER`: Read Kubernetes credentials from pod (default on)
- `KUBE_NAMESPACES_ONLY`: Monitor a list of specific namespaces, specified either as json array or as a string of comma seperated values (`foo_namespace,bar_namespace`).
