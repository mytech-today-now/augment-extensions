# Kubernetes Integration Rules

## Overview

Best practices for building Kubernetes-native Go applications including client-go usage, custom controllers, operators, and resource management.

## Rules

### 1. Use Official Kubernetes Client Libraries

**Rule**: Always use `k8s.io/client-go` for Kubernetes API interactions.

**Rationale**: Official client libraries provide type-safe, versioned access to Kubernetes APIs with proper error handling and retry logic.

**Good Example**:
```go
import (
    "k8s.io/client-go/kubernetes"
    "k8s.io/client-go/rest"
    "k8s.io/client-go/tools/clientcmd"
)

func NewK8sClient() (*kubernetes.Clientset, error) {
    config, err := rest.InClusterConfig()
    if err != nil {
        // Fallback to kubeconfig for local development
        config, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
        if err != nil {
            return nil, fmt.Errorf("failed to build config: %w", err)
        }
    }
    
    clientset, err := kubernetes.NewForConfig(config)
    if err != nil {
        return nil, fmt.Errorf("failed to create clientset: %w", err)
    }
    
    return clientset, nil
}
```

### 2. Implement Proper Resource Watching

**Rule**: Use informers and listers for efficient resource watching instead of polling.

**Rationale**: Informers provide efficient, cached access to Kubernetes resources with automatic updates.

**Good Example**:
```go
import (
    "k8s.io/client-go/informers"
    "k8s.io/client-go/tools/cache"
)

func WatchPods(clientset *kubernetes.Clientset) {
    factory := informers.NewSharedInformerFactory(clientset, 30*time.Second)
    podInformer := factory.Core().V1().Pods().Informer()
    
    podInformer.AddEventHandler(cache.ResourceEventHandlerFuncs{
        AddFunc: func(obj interface{}) {
            pod := obj.(*corev1.Pod)
            log.Printf("Pod added: %s/%s", pod.Namespace, pod.Name)
        },
        UpdateFunc: func(oldObj, newObj interface{}) {
            pod := newObj.(*corev1.Pod)
            log.Printf("Pod updated: %s/%s", pod.Namespace, pod.Name)
        },
        DeleteFunc: func(obj interface{}) {
            pod := obj.(*corev1.Pod)
            log.Printf("Pod deleted: %s/%s", pod.Namespace, pod.Name)
        },
    })
    
    stopCh := make(chan struct{})
    defer close(stopCh)
    
    factory.Start(stopCh)
    factory.WaitForCacheSync(stopCh)
    
    <-stopCh
}
```

### 3. Handle API Errors Gracefully

**Rule**: Check for specific Kubernetes API errors using `apierrors` package.

**Good Example**:
```go
import "k8s.io/apimachinery/pkg/api/errors"

func GetPod(clientset *kubernetes.Clientset, namespace, name string) (*corev1.Pod, error) {
    pod, err := clientset.CoreV1().Pods(namespace).Get(context.TODO(), name, metav1.GetOptions{})
    if err != nil {
        if errors.IsNotFound(err) {
            return nil, fmt.Errorf("pod %s/%s not found", namespace, name)
        }
        if errors.IsUnauthorized(err) {
            return nil, fmt.Errorf("unauthorized to access pod: %w", err)
        }
        return nil, fmt.Errorf("failed to get pod: %w", err)
    }
    return pod, nil
}
```

### 4. Use Controller Runtime for Custom Controllers

**Rule**: Use `sigs.k8s.io/controller-runtime` for building custom controllers and operators.

**Good Example**:
```go
import (
    ctrl "sigs.k8s.io/controller-runtime"
    "sigs.k8s.io/controller-runtime/pkg/client"
)

type PodReconciler struct {
    client.Client
    Scheme *runtime.Scheme
}

func (r *PodReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
    var pod corev1.Pod
    if err := r.Get(ctx, req.NamespacedName, &pod); err != nil {
        if errors.IsNotFound(err) {
            return ctrl.Result{}, nil
        }
        return ctrl.Result{}, err
    }
    
    // Reconciliation logic here
    
    return ctrl.Result{}, nil
}
```

### 5. Implement Leader Election for High Availability

**Rule**: Use leader election for controllers running in multiple replicas.

**Good Example**:
```go
import "k8s.io/client-go/tools/leaderelection"

func RunWithLeaderElection(ctx context.Context, clientset *kubernetes.Clientset) {
    lock := &resourcelock.LeaseLock{
        LeaseMeta: metav1.ObjectMeta{
            Name:      "my-controller",
            Namespace: "default",
        },
        Client: clientset.CoordinationV1(),
        LockConfig: resourcelock.ResourceLockConfig{
            Identity: os.Getenv("POD_NAME"),
        },
    }
    
    leaderelection.RunOrDie(ctx, leaderelection.LeaderElectionConfig{
        Lock:          lock,
        LeaseDuration: 15 * time.Second,
        RenewDeadline: 10 * time.Second,
        RetryPeriod:   2 * time.Second,
        Callbacks: leaderelection.LeaderCallbacks{
            OnStartedLeading: func(ctx context.Context) {
                // Start controller logic
            },
            OnStoppedLeading: func() {
                log.Fatal("lost leadership")
            },
        },
    })
}
```

## References

- [Kubernetes Client-Go](https://github.com/kubernetes/client-go)
- [Controller Runtime](https://github.com/kubernetes-sigs/controller-runtime)
- [Kubebuilder Book](https://book.kubebuilder.io/)

