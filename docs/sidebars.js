
module.exports = {
  docs: [
    {
      collapsed: true,
      type: "category",
      label: "Introduction to OpenEBS",
      customProps: {
        icon: "Smile"
      },
      items: [
        {
          type: "doc",
          id: "introduction-to-openebs/overview",
          label: "Overview"
        },
        {
          type: "doc",
          id: "introduction-to-openebs/features",
          label: "Features"
        },
        {
          type: "doc",
          id: "introduction-to-openebs/benefits",
          label: "Benefits"
        },
        {
          type: "doc",
          id: "introduction-to-openebs/usecases",
          label: "Use Cases and Examples"
        }
      ]
    },
    {
      collapsed: true,
      type: "category",
      label: "Concepts",
      customProps: {
        icon: "Server"
      },
      items: [
        {
          type: "doc",
          id: "concepts/basics",
          label: "Basics"
        },
        {
          type: "doc",
          id: "concepts/cns",
          label: "Container Native Storage"
        },
        {
          type: "doc",
          id: "concepts/architecture",
          label: "Architecture"
        },
        {
          collapsed: true,
          type: "category",
          label: "Data Engines",
          customProps: {
            icon: "Book"
          },
          items: [
            {
              type: "doc",
              id: "concepts/data-engines/dataengines",
              label: "Overview"
            },
            {
              type: "doc",
              id: "concepts/data-engines/localstorage",
              label: "Local Storage"
            },
            {
              type: "doc",
              id: "concepts/data-engines/replicated-storage",
              label: "Replicated Storage"
            }
          ] 
        },  
      ]
    },
    {
      collapsed: true,
      type: "category",
      label: "Quickstart Guide",
      customProps: {
        icon: "Clock"
      },
      items: [
        {
          type: "doc",
          id: "quickstart-guide/installation",
          label: "Installation"
        },
        {
          type: "doc",
          id: "quickstart-guide/deployment",
          label: "Deploy an Application"
        }
      ]
    },
    {
      collapsed: true,
      type: "category",
      label: "User Guides",
      customProps: {
        icon: "Users"
      },
      items: [
        {
          collapsed: true,
          type: "category",
          label: "Local Storage User Guide",
          customProps: {
            icon: "Book"
          },
          items: [
            {
              collapsed: true,
              type: "category",
              label: "Local PV Hostpath",
              customProps: {
                icon: "BookOpen"
              },
              items: [
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/local-pv-hostpath/hostpath-installation",
                  label: "Installation"
                },
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/local-pv-hostpath/hostpath-configuration",
                  label: "Configuration"
                },
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/local-pv-hostpath/hostpath-deployment",
                  label: "Deploy an Application"
                }
              ] 
            },
            {
              collapsed: true,
              type: "category",
              label: "Local PV LVM",
              customProps: {
                icon: "BookOpen"
              },
              items: [
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/local-pv-lvm/lvm-installation",
                  label: "Installation"
                },
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/local-pv-lvm/lvm-configuration",
                  label: "Configuration"
                },
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/local-pv-lvm/lvm-deployment",
                  label: "Deploy an Application"
                },
                {
                  collapsed: true,
                  type: "category",
                  label: "Advanced Operations",
                  customProps: {
                    icon: "Layers"
                  },
                  items: [
                    {
                      type: "doc",
                      id: "user-guides/local-storage-user-guide/local-pv-lvm/advanced-operations/lvm-fs-group",
                      label: "FSGroup"
                    },
                    {
                      type: "doc",
                      id: "user-guides/local-storage-user-guide/local-pv-lvm/advanced-operations/lvm-raw-block-volume",
                      label: "Raw Block Volume"
                    },
                    {
                      type: "doc",
                      id: "user-guides/local-storage-user-guide/local-pv-lvm/advanced-operations/lvm-resize",
                      label: "Resize"
                    },
                    {
                      type: "doc",
                      id: "user-guides/local-storage-user-guide/local-pv-lvm/advanced-operations/lvm-snapshot",
                      label: "Snapshot"
                    },
                    {
                      type: "doc",
                      id: "user-guides/local-storage-user-guide/local-pv-lvm/advanced-operations/lvm-thin-provisioning",
                      label: "Thin Provisioning"
                    }
                  ]
                },
              ] 
            },
            {
              collapsed: true,
              type: "category",
              label: "Local PV ZFS",
              customProps: {
                icon: "BookOpen"
              },
              items: [
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/local-pv-zfs/zfs-installation",
                  label: "Installation"
                },
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/local-pv-zfs/zfs-configuration",
                  label: "Configuration"
                },
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/local-pv-zfs/zfs-deployment",
                  label: "Deploy an Application"
                },
                {
                  collapsed: true,
                  type: "category",
                  label: "Advanced Operations",
                  customProps: {
                    icon: "Layers"
                  },
                  items: [
                    {
                      type: "doc",
                      id: "user-guides/local-storage-user-guide/local-pv-zfs/advanced-operations/zfs-raw-block-volume",
                      label: "Raw Block Volume"
                    },
                    {
                      type: "doc",
                      id: "user-guides/local-storage-user-guide/local-pv-zfs/advanced-operations/zfs-resize",
                      label: "Resize"
                    },
                    {
                      type: "doc",
                      id: "user-guides/local-storage-user-guide/local-pv-zfs/advanced-operations/zfs-snapshot",
                      label: "Snapshot"
                    },
                    {
                      type: "doc",
                      id: "user-guides/local-storage-user-guide/local-pv-zfs/advanced-operations/zfs-clone",
                      label: "Clone"
                    },
                    {
                      type: "doc",
                      id: "user-guides/local-storage-user-guide/local-pv-zfs/advanced-operations/zfs-backup-restore",
                      label: "Backup and Restore"
                    }
                  ]
                },
              ] 
            },   
            {
              collapsed: true,
              type: "category",
              label: "Additional Information",
              customProps: {
                icon: "File"
              },
              items: [
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/additional-information/alphafeatures",
                  label: "Alpha Features"
                },
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/additional-information/k8supgrades",
                  label: "Kubernetes Upgrades - Best Practices"
                },
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/additional-information/kb",
                  label: "Knowledge Base"
                },
                {
                  type: "doc",
                  id: "user-guides/local-storage-user-guide/additional-information/backupandrestore",
                  label: "Backup and Restore"
                }
              ]
            }
          ] 
        },
        {
          collapsed: true,
          type: "category",
          label: "Replicated Storage User Guide",
          customProps: {
            icon: "Book"
          },
          items: [
            {
              collapsed: true,
              type: "category",
              label: "Replicated PV Mayastor",
              customProps: {
                icon: "BookOpen"
              },
              items: [
                {
                  type: "doc",
                  id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-installation",
                  label: "Installation"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-configuration",
                  label: "Configuration"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/rs-deployment",
                  label: "Deploy an Application"
                },
                {
                  collapsed: true,
                  type: "category",
                  label: "Advanced Operations",
                  customProps: {
                    icon: "Layers"
                  },
                  items: [
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/kubectl-plugin",
                      label: "Kubectl Plugin"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/ha",
                      label: "High Availability"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/replica-rebuilds",
                      label: "Replica Rebuilds"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/re-resize",
                      label: "Resize"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/supportability",
                      label: "Supportability"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/monitoring",
                      label: "Monitoring"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/node-cordon",
                      label: "Node Cordon"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/node-drain",
                      label: "Node Drain"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/volume-snapshots",
                      label: "Volume Snapshots"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/advanced-operations/snapshot-restore",
                      label: "Snapshot Restore"
                    }
                  ]
                },
                {
                  collapsed: true,
                  type: "category",
                  label: "Additional Information",
                  customProps: {
                    icon: "File"
                  },
                  items: [
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/additional-information/upgrade-re",
                      label: "Upgrades"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/additional-information/legacy-upgrade",
                      label: "Legacy Upgrades"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/additional-information/tips",
                      label: "Tips and Tricks"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/additional-information/performance-tips",
                      label: "Performance Tips"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/additional-information/io-path-description",
                      label: "I/O Path Description"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/additional-information/replica-operations",
                      label: "Replica Operations"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/additional-information/eventing",
                      label: "Eventing"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/additional-information/call-home-metrics",
                      label: "Call-Home Metrics"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/additional-information/ttps",
                      label: "Tested Third Party Software"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/additional-information/migrate-etcd",
                      label: "Etcd Migration Procedure"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-storage-user-guide/replicated-pv-mayastor/additional-information/scale-etcd",
                      label: "Scaling Up etcd Members"
                    }
                  ]
                }
              ] 
            }
          ] 
        },
        {
          collapsed: true,
          type: "category",
          label: "Data Migration",
          customProps: {
            icon: "Repeat"
          },
          items: [
            {
              type: "doc",
              id: "user-guides/data-migration/migration-overview",
              label: "Migration Overview"
            },
            {
              type: "doc",
              id: "user-guides/data-migration/migration-using-pv-migrate",
              label: "Migration using pv-migrate"
            },
            {
              collapsed: true,
              type: "category",
              label: "Migration using Velero",
              customProps: {
                icon: "Book"
              },
              items: [
                {
                  type: "doc",
                  id: "user-guides/data-migration/migration-using-velero/overview",
                  label: "Overview"
                },
                {
                  collapsed: true,
                  type: "category",
                  label: "Migration for Distributed DB",
                  customProps: {
                    icon: "File"
                  },
                  items: [
                    {
                      type: "doc",
                      id: "user-guides/data-migration/migration-using-velero/migration-for-distributed-db/distributeddb-backup",
                      label: "Backing up from cStor"
                    },
                    {
                      type: "doc",
                      id: "user-guides/data-migration/migration-using-velero/migration-for-distributed-db/distributeddb-restore",
                      label: "Restoring to Replicated Storage"
                    }
                  ]
                },
                {
                  collapsed: true,
                  type: "category",
                  label: "Migration for Replicated DB",
                  customProps: {
                    icon: "File"
                  },
                  items: [
                    {
                      type: "doc",
                      id: "user-guides/data-migration/migration-using-velero/migration-for-replicated-db/replicateddb-backup",
                      label: "Backing up from cStor"
                    },
                    {
                      type: "doc",
                      id: "user-guides/data-migration/migration-using-velero/migration-for-replicated-db/replicateddb-restore",
                      label: "Restoring to Replicated Storage"
                    }
                  ]
                },
              ]
            },
          ] 
        },
        {
          type: "doc",
          id: "user-guides/upgrade",
          label: "Upgrades"
        },
        {
          type: "doc",
          id: "user-guides/uninstall",
          label: "Uninstallation"
        }
      ]
    },
    {
      collapsed: true,
      type: "category",
      label: "Solutioning",
      customProps: {
        icon: "File"
      },
      items: [
        {
          collapsed: true,
          type: "category",
          label: "OpenEBS on K8s Platforms",
          customProps: {
            icon: "User"
          },
          items: [
            {
              type: "doc",
              id: "Solutioning/openebs-on-kubernetes-platforms/microkubernetes",
              label: "MicroK8s"
            },
            {
              type: "doc",
              id: "Solutioning/openebs-on-kubernetes-platforms/talos",
              label: "Talos"
            },
            {
              type: "doc",
              id: "Solutioning/openebs-on-kubernetes-platforms/gke",
              label: "Google Kubernetes Engine"
            },
            {
              type: "doc",
              id: "Solutioning/openebs-on-kubernetes-platforms/rwx",
              label: "Read-Write-Many"
            }
          ]
        },  
      ]
    },
    {
      collapsed: true,
      type: "category",
      label: "Troubleshooting",
      customProps: {
        icon: "Crosshair"
      },
      items: [
        {
          type: "doc",
          id: "troubleshooting/troubleshooting",
          label: "Troubleshooting - Local Storage"
        },
        {
          type: "doc",
          id: "troubleshooting/troubleshootingrs",
          label: "Troubleshooting - Replicated Storage"
        }
      ]
    },
    {
      collapsed: true,
      type: "category",
      label: "Support",
      customProps: {
        icon: "User"
      },
      items: [
        {
          type: "doc",
          id: "community",
          label: "Community",
        },
        {
          type: "doc",
          id: "commercial",
          label: "Commercial Support"
        }
      ]
    },
    {
      type: "doc",
      id: "releases",
      label: "Releases",
      customProps: {
        icon: "File"
      },
    },
    {
      type: "doc",
      id: "faqs/faqs",
      label: "FAQs",
      customProps: {
        icon: "HelpCircle"
      },
    },
    {
      type: "doc",
      id: "glossary",
      label: "Glossary",
      customProps: {
        icon: "HelpCircle"
      },
    }
  ]
}