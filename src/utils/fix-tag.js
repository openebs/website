// TODO: remove this file in next iteration
export const fixTag = (tag) => {
  const { name } = tag
  switch (name) {
    case 'Openebs':
      tag.name = 'OpenEBS'
      break
    case 'Containerattachedstorage':
      tag.name = 'Container Attached Storage'
      break
    case 'Cncf':
      tag.name = 'CNCF'
      break
    case 'Aws Ebs':
      tag.name = 'AWS EBS'
      break
    case 'Cas':
      tag.name = 'CAS'
      break
    case 'Ci':
      tag.name = 'CI'
      break
    case 'Cka':
      tag.name = 'CKA'
      break
    case 'E2e':
      tag.name = 'E2E'
      break
    case 'E2e Testing':
      tag.name = 'E2E Testing'
      break
    case 'Eck':
      tag.name = 'ECK'
      break
    case 'Gke':
      tag.name = 'GKE'
      break
    case 'Iscsi':
      tag.name = 'iSCSI'
      break
    case 'Icp':
      tag.name = 'ICP'
      break
    case 'Kops':
      tag.name = 'kops'
      break
    case 'Localpv':
      tag.name = 'LocalPV'
      break
    case 'Longhorn':
      tag.name = 'LongHorn'
      break
    case 'Mayadata':
      tag.name = 'MayaData'
      break
    case 'Mayaonline':
      tag.name = 'MayaOnline'
      break
    case 'Mongodb':
      tag.name = 'MongoDB'
      break
    case 'Nfs':
      tag.name = 'NFS'
      break
    case 'Nuodb':
      tag.name = 'NuoDB'
      break
    case 'Openshift':
      tag.name = 'OpenShift'
      break
    case 'Owncloud':
      tag.name = 'ownCloud'
      break
    case 'Postgresql':
      tag.name = 'PostgreSQL'
      break
    case 'Stackpointcloud':
      tag.name = 'StackPointCloud'
      break
    case 'Stackstorm':
      tag.name = 'StackStorm'
      break
    case 'Statefulcontainers':
      tag.name = 'Stateful Containers'
      break
    case 'Tdd':
      tag.name = 'TDD'
      break
    case 'Vmware':
      tag.name = 'VMware'
      break
    case 'Vcenter':
      tag.name = 'vCenter'
      break
    case 'Zfs':
      tag.name = 'ZFS'
      break
    case 'Virtualbox':
      tag.name = 'VirtualBox'
      break
    case 'wordpress':
      tag.name = 'WordPress'
      break
    default:
  }

  return tag
}
