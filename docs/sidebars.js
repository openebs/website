
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
            icon: "Circle"
          },
          items: [
            {
              type: "doc",
              id: "concepts/data-engines/dataengines",
              label: "Data Engines"
            },
            {
              type: "doc",
              id: "concepts/data-engines/localengine",
              label: "Local Engine"
            },
            {
              type: "doc",
              id: "concepts/data-engines/replicated-engine",
              label: "Replicated Engine"
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
        icon: "BookOpen"
      },
      items: [
        {
          type: "doc",
          id: "quickstart-guide/quickstart",
          label: "Quickstart"
        },
        {
          type: "doc",
          id: "quickstart-guide/installation",
          label: "Installation"
        },
        {
          type: "doc",
          id: "quickstart-guide/deployment",
          label: "Deploy a Test Application"
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
          label: "Local Engine User Guide",
          customProps: {
            icon: "File"
          },
          items: [
            {
              type: "doc",
              id: "user-guides/local-engine-user-guide/prerequisites",
              label: "Prerequisites"
            },
            {
              collapsed: true,
              type: "category",
              label: "Additional Information",
              customProps: {
                icon: "Book"
              },
              items: [
                {
                  type: "doc",
                  id: "user-guides/local-engine-user-guide/additional-information/alphafeatures",
                  label: "Alpha Features"
                },
                {
                  type: "doc",
                  id: "user-guides/local-engine-user-guide/additional-information/performance-testing",
                  label: "Performance testing"
                },
                {
                  type: "doc",
                  id: "user-guides/local-engine-user-guide/additional-information/k8supgrades",
                  label: "Kubernetes Upgrades - Best Practices"
                },
                {
                  type: "doc",
                  id: "user-guides/local-engine-user-guide/additional-information/kb",
                  label: "Knowledge Base"
                }
              ]
            }
          ] 
        },
        {
          collapsed: true,
          type: "category",
          label: "Replicated Engine User Guide",
          customProps: {
            icon: "File"
          },
          items: [
            {
              type: "doc",
              id: "user-guides/replicated-engine-user-guide/prerequisites-re",
              label: "Prerequisites"
            },
            {
              collapsed: true,
              type: "category",
              label: "Advanced Operations",
              items: [
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/advanced-operations/kubectl-plugin",
                  label: "Kubectl Plugin"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/advanced-operations/ha",
                  label: "High Availability"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/advanced-operations/replica-rebuilds",
                  label: "Replica Rebuilds"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/advanced-operations/supportability",
                  label: "Supportability"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/advanced-operations/monitoring",
                  label: "Monitoring"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/advanced-operations/node-cordon",
                  label: "Node Cordon"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/advanced-operations/node-drain",
                  label: "Node Drain"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/advanced-operations/volume-snapshots",
                  label: "Volume Snapshots"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/advanced-operations/snapshot-restore",
                  label: "Snapshot Restore"
                }
              ]
            },
            {
              collapsed: true,
              type: "category",
              label: "Additional Information",
              items: [
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/additional-information/tips",
                  label: "Tips and Tricks"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/additional-information/performance-tips",
                  label: "Performance Tips"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/additional-information/io-path-description",
                  label: "I/O Path Description"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/additional-information/replica-operations",
                  label: "Replica Operations"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/additional-information/call-home-metrics",
                  label: "Call-Home Metrics"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/additional-information/ttps",
                  label: "Tested Third Party Software"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/additional-information/migrate-etcd",
                  label: "Etcd Migration Procedure"
                },
                {
                  type: "doc",
                  id: "user-guides/replicated-engine-user-guide/additional-information/scale-etcd",
                  label: "Scaling Up etcd Members"
                },
                {
                  collapsed: true,
                  type: "category",
                  label: "Migration for Distributed DB",
                  customProps: {
                    icon: ""
                  },
                  items: [
                    {
                      type: "doc",
                      id: "user-guides/replicated-engine-user-guide/additional-information/migration-for-distributed-db/distributeddb-overview",
                      label: "Distributed DB Overview"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-engine-user-guide/additional-information/migration-for-distributed-db/distributeddb-backup",
                      label: "Backing up from cStor"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-engine-user-guide/additional-information/migration-for-distributed-db/distributeddb-restore",
                      label: "Restoring Mayastor"
                    }
                  ]
                },
                {
                  collapsed: true,
                  type: "category",
                  label: "Migration for Replicated DB",
                  customProps: {
                    icon: ""
                  },
                  items: [
                    {
                      type: "doc",
                      id: "user-guides/replicated-engine-user-guide/additional-information/migration-for-replicated-db/replicateddb-overview",
                      label: "Replicated DB Overview"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-engine-user-guide/additional-information/migration-for-replicated-db/replicateddb-backup",
                      label: "Backing up from cStor"
                    },
                    {
                      type: "doc",
                      id: "user-guides/replicated-engine-user-guide/additional-information/migration-for-replicated-db/replicateddb-restore",
                      label: "Restoring Mayastor"
                    }
                  ]
                }
              ]
            },
            {
              type: "doc",
              id: "user-guides/replicated-engine-user-guide/platform-support",
              label: "Platform Support"
            }
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
      label: "Troubleshooting",
      customProps: {
        icon: "Crosshair"
      },
      items: [
        {
          type: "doc",
          id: "troubleshooting/troubleshooting",
          label: "Troubleshooting - Local Engine"
        },
        {
          type: "doc",
          id: "troubleshooting/troubleshooting-re",
          label: "Troubleshooting - Replicated Engine"
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
      id: "community",
      label: "Community",
      customProps: {
        icon: "Conversation"
      },
    },
    {
      type: "doc",
      id: "commercial",
      label: "Commercial Support"
    }
  ]
}