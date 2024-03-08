

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
          label: "Introduction to OpenEBS"
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
          label: "Use cases"
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
          id: "concepts/cas",
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
              id: "concepts/data-engines/casengines",
              label: "Data Engines"
            },
            {
              type: "doc",
              id: "concepts/data-engines/localpv",
              label: "Local Engine"
            },
            {
              type: "doc",
              id: "concepts/data-engines/mayastor",
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
            icon: ""
          },
          items: [
            {
              type: "doc",
              id: "user-guides/local-engine-user-guide/prerequisites",
              label: "Local Engine Prerequisites"
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
                  id: "user-guides/local-engine-user-guide/additional-info/alphafeatures",
                  label: "Alpha Features"
                },
                {
                  type: "doc",
                  id: "user-guides/local-engine-user-guide/additional-info/performance-testing",
                  label: "Performance testing"
                },
                {
                  type: "doc",
                  id: "user-guides/local-engine-user-guide/additional-info/k8supgrades",
                  label: "Kubernetes Upgrades - Best Practices"
                },
                {
                  type: "doc",
                  id: "user-guides/local-engine-user-guide/additional-info/kb",
                  label: "Knowledge Base"
                }
              ]
            }
          ] 
        },
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
        {
          type: "doc",
          id: "user-guides/upgrade",
          label: "Upgrade"
        },
        {
          type: "doc",
          id: "user-guides/uninstall",
          label: "Uninstall"
        }
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
        {
          type: "doc",
          id: "troubleshooting/troubleshooting",
          label: "Overview"
        },
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
};