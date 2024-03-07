

module.exports = {
  docs: [
    {
      collapsed: true,
      type: "category",
      label: "OpenEBS Documentation",
      customProps: {
        icon: "Smile"
      },
      items: [
        {
          collapsed: true,
          type: "category",
          label: "Introduction to OpenEBS",
          customProps: {
            icon: ""
          },
          items: [
            {
              type: "doc",
              id: "openebs-documentation/introduction-to-openebs/introduction-to-openebs",
              label: "Introduction to OpenEBS"
            },
            {
              type: "doc",
              id: "openebs-documentation/introduction-to-openebs/features",
              label: "Features"
            },
            {
              type: "doc",
              id: "openebs-documentation/introduction-to-openebs/benefits",
              label: "Benefits"
            },
            {
              type: "doc",
              id: "openebs-documentation/introduction-to-openebs/use-cases-and-examples",
              label: "Use Cases and Examples"
            },
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
              id: "concepts/container-native-storage",
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
                icon: ""
              },
              items: [
                {
                  type: "doc",
                  id: "concepts/data-engines/local-engine",
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
            icon: "Users"
          },
          items: [
            {
              type: "doc",
              id: "quickstart-guide/installation",
              label: "Installation"
            },
            {
              type: "doc",
              id: "quickstart-guide/deploy-a-test-application",
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
              type: "doc",
              id: "user-guides/quickstart",
              label: "Quickstart"
            },
            {
              type: "doc",
              id: "user-guides/prerequisites",
              label: "Prerequisites"
            },
            {
              type: "doc",
              id: "user-guides/installation",
              label: "Installation"
            },
            {
              type: "doc",
              id: "user-guides/ndm",
              label: "NDM"
            },
            {
              collapsed: true,
              type: "category",
              label: "cStor",
              customProps: {
                icon: ""
              },
              items: [
                {
                  type: "doc",
                  id: "user-guides/cstor/install-and-setup",
                  label: "Install and Setup"
                },
                {
                  type: "doc",
                  id: "user-guides/cstor/launch-sample-application",
                  label: "Launch"
                },
                {
                  type: "doc",
                  id: "user-guides/cstor/troubleshooting",
                  label: "Troubleshooting"
                },
                {
                  type: "doc",
                  id: "user-guides/cstor/advanced",
                  label: "Advanced"
                },
                {
                  type: "doc",
                  id: "user-guides/cstor/clean-up",
                  label: "Clean up"
                }
              ]
            },
            {

              collapsed: true,
              type: "category",
              label: "Jiva",
              customProps: {
                icon: ""
              },
              items: [
                {
                  type: "doc",
                  id: "user-guides/jiva/jiva-prerequisites",
                  label: "Prerequisites"
                },
                {
                  type: "doc",
                  id: "user-guides/jiva/jiva-install",
                  label: "Install and Setup"
                },
                {
                  type: "doc",
                  id: "user-guides/jiva/jiva-launch",
                  label: "Launch"
                }
              ]
            },
            {
              type: "doc",
              id: "user-guides/mayastor",
              label: "Mayastor"
            },
            {
              type: "doc",
              id: "user-guides/localpv-hostpath",
              label: "Local PV Hostpath"
            },
            {
              type: "doc",
              id: "user-guides/localpv-device",
              label: "Local PV Device"
            },
            // {
            //   type: "doc",
            //   id: "user-guides/upgrade",
            //   label: "Upgrade"
            // },
            // {
            //   type: "doc",
            //   id: "user-guides/uninstall",
            //   label: "Uninstall"
            // }
          ]
        },
        {
          collapsed: true,
          type: "category",
          label: "Stateful Applications",
          customProps: {
            icon: "Layers"
          },
          items: [
            {
              type: "doc",
              id: "stateful-applications/mysql",
              label: "RDS like MySQL"
            },
            {
              type: "doc",
              id: "stateful-applications/prometheus",
              label: "Prometheus"
            },
            {
              type: "doc",
              id: "stateful-applications/minio",
              label: "MinIO"
            },
            {
              type: "doc",
              id: "stateful-applications/gitlab",
              label: "GitLab"
            },
            {
              type: "doc",
              id: "stateful-applications/percona",
              label: "Percona"
            },
            {
              type: "doc",
              id: "stateful-applications/elasticsearch",
              label: "Elasticsearch"
            },
            {
              type: "doc",
              id: "stateful-applications/cockroachdb",
              label: "CockroachDB"
            },
            {
              type: "doc",
              id: "stateful-applications/cassandra",
              label: "Cassandra"
            },
            {
              type: "doc",
              id: "stateful-applications/nuodb",
              label: "NuoDB"
            },
            {
              type: "doc",
              id: "stateful-applications/postgres",
              label: "PostgreSQL"
            },
            {
              type: "doc",
              id: "stateful-applications/redis",
              label: "Redis"
            },
            {
              type: "doc",
              id: "stateful-applications/mongodb",
              label: "MongoDB"
            },
            {
              type: "doc",
              id: "stateful-applications/jira",
              label: "Jira"
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
            // {
            //   type: "doc",
            //   id: "troubleshooting/troubleshooting",
            //   label: "Overview"
            // },
            {
              type: "doc",
              id: "troubleshooting/install",
              label: "Install"
            },
            {
              type: "doc",
              id: "troubleshooting/uninstall",
              label: "Uninstall"
            },
            {
              type: "doc",
              id: "troubleshooting/ndm",
              label: "NDM"
            },
            {
              type: "doc",
              id: "troubleshooting/volume-provisioning",
              label: "Volume Provisioning"
            },
            {
              type: "doc",
              id: "troubleshooting/jiva",
              label: "Jiva"
            },
            {
              type: "doc",
              id: "troubleshooting/cstor",
              label: "cStor"
            },
            {
              type: "doc",
              id: "troubleshooting/localpv",
              label: "LocalPV"
            },
            {
              type: "doc",
              id: "troubleshooting/mayastor",
              label: "Mayastor"
            }
          ]
        },
        {
          collapsed: true,
          type: "category",
          label: "FAQs",
          customProps: {
            icon: "HelpCircle"
          },
          items: [
            {
              type: "doc",
              id: "faqs/general",
              label: "General OpenEBS FAQs"
            },
            {
              type: "doc",
              id: "faqs/cstor-faq",
              label: "cStor FAQs"
            }
          ]
        },
        {
          collapsed: true,
          type: "category",
          label: "Additional info",
          customProps: {
            icon: "BookOpen"
          },
          items: [
            {
              type: "doc",
              id: "additional-info/alphafeatures",
              label: "Alpha Features"
            },
            {
              type: "doc",
              id: "additional-info/performance-testing",
              label: "Performance testing"
            },
            {
              type: "doc",
              id: "additional-info/k8supgrades",
              label: "Kubernetes upgrades"
            },
            {
              type: "doc",
              id: "additional-info/kb",
              label: "Knowledge Base"
            }
          ]
        },
        {
          collapsed: true,
          type: "category",
          label: "Deprecated",
          customProps: {
            icon: "File"
          },
          items: [
            {
              type: "doc",
              id: "deprecated/releases-1x",
              label: "releases-1x"
            },
            {
              type: "doc",
              id: "deprecated/releases-0x",
              label: "releases-0x"
            },
            {
              type: "doc",
              id: "deprecated/mayactl",
              label: "mayactl"
            },
          ]
        }
      ]
    }
  ]
};    