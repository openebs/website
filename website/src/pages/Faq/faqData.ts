import { useTranslation } from 'react-i18next';

interface FaqDataProps {
  id: number;
  title: string;
  desc: string;
  topic: string;
  topic_id: number;
}

const FaqDetails = () => {
  const { t } = useTranslation();
  const answer2 = 'OpenEBS is currently tightly integrated into Kubernetes. Support for Docker Swarm is something we are looking at for the future \n\n The system requirements depend on the number of volumes that are provisioned and can horizontally scale with the number of nodes in the Kubernetes cluster. The OpenEBS control plane comprises of a minimum of two pods - API server and dynamic provisioner. These can be run using 2GB RAM and 2 CPUs. \n\n Each volume spins up the IO controller and replica pods. \n\n Each of these requires 1GB RAM and 0.5 CPU by default. For enabling high-availability, the recommendation is to have a minimum of 3 nodes in the Kubernetes cluster.';
  const answer3 = 'There are at least four common reasons given for running OpenEBS on Amazon EBS \n\n  * Attach/detach - The attach/detach process can slow the operation of environments dependent upon EBS. \n\n * No volume management needed- OpenEBS removes the need for volume management, enabling the combination of multiple underlying EBS volumes without the user needing to run LVM or other volume managers. This saves time and reduces operational complexity.\n\n * Expansion and inclusion of NVMe - OpenEBS allows users to add additional capacity without experiencing downtime. This online addition of capacity can include NVMe and SSD instances from cloud providers or deploy in physical servers. This means that as performance requirements increase, or decrease, Kubernetes can be used via storage policies to instruct OpenEBS to change capacity accordingly. \n\n * Other enterprise capabilities- OpenEBS adds other capabilities such as extremely efficient snapshots and clones as well as forthcoming capabilities such as encryption. Snapshots and clones facilitate much more efficient CI/CD workflows because zero space copies of databases and other stateful workloads can be used in these and other workflows, improving these workflows without incurring additional storage space or administrative effort. The snapshot capabilities can also be used for replication. As of February 2018, these replication capabilities are under development.';
  const answer5 = 'An OpenEBS Jiva Volume is a controller deployed during the OpenEBS installation. The parameter defines volume replicas we set in the PVC specification. The controller is an iSCSI target while the replicas play the role of a disk. The controller exposes the iSCSI target while the actual data is written through the replicas- the controller and each replica run inside a dedicated container. An OpenEBS Jiva Volume controller exists as a single instance, but there can be multiple instances of OpenEBS Jiva volume replicas. Persistent data is replicated synchronously to all the replicas. OpenEBS Jiva Volume HA is based on various scenarios, as explained in the following sections. NOTE: Each replica is scheduled in a unique K8s node, and a K8s node never has two replicas of one OpenEBS volume. \n\n  #### What happens when an OpenEBS volume controller pod crashes? \n\n Kubernetes automatically reschedules the controller as a new Kubernetes pod. Policies are in place that ensure faster rescheduling. \n\n #### What happens when a K8s node that hosts the OpenEBS volume controller goes offline? \n\n The controller is automatically rescheduled as a new Kubernetes pod. Policies are in place that ensure faster rescheduling. If the Kubernetes node is unavailable, the controller gets scheduled on one of the available nodes. \n\n #### What happens when an OpenEBS volume replica pod crashes for reasons other than node not-ready and node unreachable? \n\n The number of replicas is expected to be a minimum of 3 to make sure data is continuously available and resiliency achieved. If one replica entirely becomes unavailable, a new replica is generated and is rebuilt with the data from the existing replicas. However, if there are only two replicas, a replica loss will result in the other replicas turning into Read-Only, and hence the entire persistent volume turning into Read-Only. \n\n #### What happens when a K8s node that hosts OpenEBS volume replica goes offline? \n\n There is no storage downtime as the other available replica displays inputs/outputs. Policies are in place that does not allow rescheduling of the crashed replica (as the replica is tied to a node’s resources) to any other node.';
  const answer6 = 'One of the significant differences between OpenEBS versus other similar approaches is that no changes are required to run OpenEBS on Kubernetes. However, OpenEBS itself is a workload, and the easy management of it is crucial, mainly as the Container Attached Storage approach entails putting containers that are IO controller and replica controllers. \n\n OpenEBS IO controller can be accessed via iSCSI, exposed as a Service. The nodes will need to have an iSCSI initiator installed. In case the kubelet is running in a container like in the case of Rancher, etc., the iSCSI initiator should be installed within the kubelet container.';
  const answer7 = 'If you have a Kubernetes environment, you can deploy OpenEBS with: \n\n  *kubectl apply -f https://openebs.github.io/charts/openebs-operator.yaml* \n\n Users often begin by then running a workload against OpenEBS. There are a large and growing number of workloads that have storage classes that use OpenEBS. You do not need to use these specific storage classes; however, they may be helpful as they save time and allow for per workload customization. You should join the Slack channel at: [https://openebs-community.slack.com](https://openebs-community.slack.com)\n\n Register at [OpenEBS Enterprise Platform](https://portal.mayadata.io/) to receive free monitoring and a single view of stateful workloads of your Kubernetes environment. Director Online, part of OpenEBS Enterprise Platform, incorporates customized versions of Prometheus for monitoring, Grafana for metrics visualization and Scope to see the overall environment, and our MuleBot for ChatOps integration and more.';
  const answer9 = `OpenEBS stores data in a configurable number of replicas. These are placed to maximize resiliency, so, for example, they are placed in different racks or availability zones. \n\n To determine exactly where your data is physically stored, you can run the following kubectl commands: \n\n a. Run kubectl get pvc to fetch the Volume name. The volume name looks like- pvc-ee171da3-07d5-11e8-a5be-42010a8001be \n\n b. For each volume, you will notice one IO controller pod and one or more replicas (as per the storage class configuration). For the above PVC, run the following command to get the IO controller and replica pods. kubectl get pods --all-namespaces | grep pvc-ee171da3-07d5-11e8-a5be-42010a8001be. The output will show the following pods- \n\n ..- IO Controller- pvc-ee171da3-07d5-11e8-a5be-42010a8001be-ctrl-6798475d8c-7dcqd ..- Replica 1- pvc-ee171da3-07d5-11e8-a5be-42010a8001be-rep-86f8b8c758-hls6s ..- Replica 2- pvc-ee171da3-07d5-11e8-a5be-42010a8001be-rep-86f8b8c758-tr28f; \n\n c. To check the location where the data is stored, get the details of the replica pod. For getting the details of Replica 1 above, use the following command: \n\n kubectl get pod -o yaml pvc-ee171da3-07d5-11e8-a5be-42010a8001be-rep-86f8b8c758-hls6s \n\n Check for the volumes section: \n\n ~~~volumes:
  - hostPath:
      path: /var/openebs/pvc-ee171da3-07d5-11e8-a5be-42010a8001be
      type: ""
    name: openebs`;
  const answer10 = 'OpenEBS has been engineered not to require any changes to the containers on which it runs. Similarly, Kubernetes itself does not need to be altered, and no additional external orchestrator is required. However, the workloads that need storage do need to be running on hosts that have iSCSI initiators, which is a default configuration in almost all operating systems. \n\n #### What changes need to be made to the containers on which OpenEBS runs? \n\n Performance tests on the current release v.0.5.2 show acceptable performance, but additional efforts are ongoing to improve performance. OpenEBS will soon implement a variety of changes to improve performance elsewhere in the stack - and much more is to come via the cStor storage engine.';

  // Sample JSON data for faq, which will be replace once APIs are ready
  const FaqData: FaqDataProps[] = [
    {
      id: 1,
      title: t('faqDetails.question1'),
      desc: t('faqDetails.answer1'),
      topic: 'architecture',
      topic_id: 1,
    },

    {
      id: 2,
      title: t('faqDetails.question2'),
      desc: answer2,
      topic: 'architecture',
      topic_id: 1,
    },

    {
      id: 3,
      title: t('faqDetails.question3'),
      desc: answer3,
      topic: 'usage',
      topic_id: 0,
    },

    {
      id: 4,
      title: t('faqDetails.question4'),
      desc: t('faqDetails.answer4'),
      topic: 'preformance',
      topic_id: 3,
    },

    {
      id: 5,
      title: t('faqDetails.question5'),
      desc: answer5,
      topic: 'preformance',
      topic_id: 3,
    },

    {
      id: 6,
      title: t('faqDetails.question6'),
      desc: answer6,
      topic: 'preformance',
      topic_id: 3,
    },

    {
      id: 7,
      title: t('faqDetails.question7'),
      desc: answer7,
      topic: 'getting started',
      topic_id: 2,
    },

    {
      id: 8,
      title: t('faqDetails.question8'),
      desc: t('faqDetails.answer8'),
      topic: 'architecture',
      topic_id: 2,
    },

    {
      id: 9,
      title: t('faqDetails.question9'),
      desc: answer9,
      topic: 'usage',
      topic_id: 0,
    },

    {
      id: 10,
      title: t('faqDetails.question10'),
      desc: answer10,
      topic: 'preformance',
      topic_id: 3,
    },

    {
      id: 11,
      title: t('faqDetails.question11'),
      desc: t('faqDetails.answer11'),
      topic: 'usage',
      topic_id: 0,
    },
  ];

  return FaqData;
};
export default FaqDetails;
