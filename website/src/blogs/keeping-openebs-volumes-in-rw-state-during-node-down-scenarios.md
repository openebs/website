---
title: Keeping OpenEBS volumes in RW state during “Node down” scenarios
author: Sai Chaithanya
author_info: A developer who is always eager to learn, loves algorithms, maths, Kubernetes, and programming, passionate about Data Science. Enjoys playing kabaddi and traveling.
date: 30-08-2018
tags: Kubernetes, Chaos Engineering, Statefulset, OpenEBS
excerpt: In this blog, I will go through a read-only issue faced at our lab in Kubernetes environment while using OpenEBS, and will also go through its possible workarounds.
---

In this post, I will go through a read-only issue experienced in the Kubernetes environment while using OpenEBS in our lab and possible workarounds.

OpenEBS has the below deployment method for providing persistent storage to applications in Kubernetes clusters.

As shown in the above diagram, the application container runs on Node1, and an iSCSI target is runs on Node2 [There can be a case where the application and iSCSI target are running on the same node, but we don’t notice the issue in this scenario]. The iSCSI initiator of Node1 discovers and logs in to the iSCSI target and creates the disk `/dev/sdb`. The application consumes the mount point `/mnt/vol1` created over the disk `/dev/sdb` as persistent storage.

When the node on which the iSCSI target, i.e. Node2, goes down, K8s then takes 5 minutes to schedule the iSCSI target on another node. This causes the mount point to enter a `Read-Only (RO)` state. Below are logs related to this issue:

    Aug 28 18:13:29 instance-1 kernel: [28477.898809] connection12:0: detected conn error (1020)
    Aug 28 18:15:30 instance-1 kernel: [28598.723742] sd 1:0:0:0: rejecting I/O to offline device
    Aug 28 18:15:30 instance-1 kernel: [28598.730019] print_req_error: I/O error, dev sdb, sector 642376
    Aug 28 18:15:30 instance-1 kernel: [28598.737360] EXT4-fs warning (device sdb): ext4_end_bio:323: I/O error 10 writing to inode 12 (offset 186290176 size 258048 starting block 80360)
    Aug 28 18:15:30 instance-1 kernel: [28598.737364] buffer_io_error: 19448 callbacks suppressed
    Aug 28 18:15:30 instance-1 kernel: [28598.737365] Buffer I/O error on device sdb, logical block 80297
    Aug 28 18:15:30 instance-1 kernel: [28598.999756] sd 1:0:0:0: rejecting I/O to offline device
    Aug 28 18:15:30 instance-1 kernel: [28599.006255] JBD2: Detected IO errors while flushing file data on sdb-8
    Aug 28 18:15:30 instance-1 kernel: [28599.006266] Aborting journal on device sdb-8.
    Aug 28 18:15:30 instance-1 kernel: [28599.012364] sd 1:0:0:0: rejecting I/O to offline device
    Aug 28 18:15:30 instance-1 kernel: [28599.018784] Buffer I/O error on dev sdb, logical block 0, lost sync page write
    Aug 28 18:15:30 instance-1 kernel: [28599.028645] EXT4-fs error (device sdb): ext4_journal_check_start:61: Detected aborted journal
    Aug 28 18:15:30 instance-1 kernel: [28599.037759] EXT4-fs (sdb): Remounting filesystem read-only
    Aug 28 18:15:30 instance-1 kernel: [28599.045331] sd 1:0:0:0: rejecting I/O to offline device
    Aug 28 18:15:30 instance-1 kernel: [28599.052005] Buffer I/O error on dev sdb, logical block 131072, lost sync page write

As shown in the above logs, when the connection is broken the iSCSI initiator reconnects and times out after 120 seconds. This makes the mount point go into RO mode. By this time, the application containers move into the “CrashLoopback” state. To bring applications back to the Running state, a lot of manual work must be done by remounting the mount point in RW mode. It is even possible that the application could treat the host directory as a mount point and will continue writing data, which can lead to data loss or corruption.

If the iSCSI initiator had waited for 300+ seconds, the mount should have stayed in RW mode, therefore reducing the amount of manual work.

We now need to find the setting from which the iSCSI initiator obtained this timeout value. Let us first look at “iscsiadm -m session -P 3” output.

    iSCSI Transport Class version 2.0–870
    version 2.0–873
    Target: iqn.2016–09.com.openebs.cstor:vol1 (non-flash)
    Current Portal: 10.142.0.2:3260,1
    Persistent Portal: 10.142.0.2:3260,1
    **********
    Interface:
    **********
    Iface Name: default
    Iface Transport: tcp
    Iface Initiatorname: iqn.1993–08.org.debian:01:9b16db669dce
    Iface IPaddress: 10.142.0.2
    Iface HWaddress: <empty>
    Iface Netdev: <empty>
    SID: 11
    iSCSI Connection State: LOGGED IN
    iSCSI Session State: LOGGED_IN
    Internal iscsid Session State: NO CHANGE
    *********
    Timeouts:
    *********
    Recovery Timeout: 120
    Target Reset Timeout: 30
    LUN Reset Timeout: 30
    Abort Timeout: 15
    *****
    CHAP:
    *****
    username: <empty>
    password: ********
    username_in: <empty>
    password_in: ********
    ************************
    Negotiated iSCSI params:
    ************************
    HeaderDigest: None
    DataDigest: None
    MaxRecvDataSegmentLength: 262144
    MaxXmitDataSegmentLength: 262144
    FirstBurstLength: 262144
    MaxBurstLength: 1048576
    ImmediateData: Yes
    InitialR2T: No
    MaxOutstandingR2T: 1
    ************************
    Attached SCSI devices:
    ************************
    Host Number: 1 State: running
    scsi1 Channel 00 Id 0 Lun: 0
    Attached scsi disk sdb State: running
    

To set this value, iscsid.conf has a setting called “**node.session.timeo.replacement_timeout**”. Modifying this and performing a login into the iSCSI target produces the following output for the “iscsiadm -m session -P 3” command:

    <<snippet>>
    Iface Initiatorname: iqn.1993–08.org.debian:01:9b16db669dce
    Iface IPaddress: 10.142.0.2
    Iface HWaddress: <empty>
    Iface Netdev: <empty>
    SID: 13
    iSCSI Connection State: LOGGED IN
    iSCSI Session State: LOGGED_IN
    Internal iscsid Session State: NO CHANGE
    *********
    Timeouts:
    *********
    Recovery Timeout: 300
    Target Reset Timeout: 30
    LUN Reset Timeout: 30
    Abort Timeout: 15
    <<snippet>>
    

Here, we can see that “Recovery Timeout” under “Timeouts” section is now shown as 300.

Let’s look at kernel logs when the connection is broken:

    Aug 28 18:38:14 instance-1 kernel: [29963.084882] connection13:0: detected conn error (1020)
    Aug 28 18:43:15 instance-1 kernel: [30263.588590] session13: session recovery timed out after 300 secs
    Aug 28 18:43:15 instance-1 kernel: [30263.596529] sd 1:0:0:0: rejecting I/O to offline device
    Aug 28 18:43:15 instance-1 kernel: [30263.602429] print_req_error: 16 callbacks suppressed
    Aug 28 18:43:15 instance-1 kernel: [30263.602430] print_req_error: I/O error, dev sdb, sector 643248
    Aug 28 18:43:15 instance-1 kernel: [30263.609938] EXT4-fs warning (device sdb): ext4_end_bio:323: I/O error 10 writing to inode 12 (offset 186736640 size 520192 starting block 80533)
    Aug 28 18:43:15 instance-1 kernel: [30263.609943] buffer_io_error: 3951 callbacks suppressed
    Aug 28 18:43:15 instance-1 kernel: [30263.609945] Buffer I/O error on device sdb, logical block 80406
    Aug 28 18:43:16 instance-1 kernel: [30265.229113] sd 1:0:0:0: rejecting I/O to offline device
    Aug 28 18:43:16 instance-1 kernel: [30265.236187] sd 1:0:0:0: rejecting I/O to offline device
    Aug 28 18:43:20 instance-1 kernel: [30269.488365] print_req_error: I/O error, dev sdb, sector 0
    Aug 28 18:43:20 instance-1 kernel: [30269.493883] print_req_error: I/O error, dev sdb, sector 0
    Aug 28 18:43:20 instance-1 kernel: [30269.499621] Buffer I/O error on dev sdb, logical block 0, lost sync page write
    Aug 28 18:43:20 instance-1 kernel: [30269.507654] EXT4-fs error (device sdb): ext4_journal_check_start:61: Detected aborted journal
    Aug 28 18:43:20 instance-1 kernel: [30269.517548] EXT4-fs (sdb): Remounting filesystem read-only
    Aug 28 18:43:20 instance-1 kernel: [30269.524898] EXT4-fs (sdb): previous I/O error to superblock detected
    Aug 28 18:43:21 instance-1 kernel: [30269.579913] sd 1:0:0:0: rejecting I/O to offline device
    

Perfect!

We notice that the iSCSI initiator is actually using this timeout setting to stop the session recovery. Also, the mount point switched to read-only after 300 seconds.

**What about the sessions that are already logged into iSCSI target?**

The below command can be used to change the setting for logged-in sessions:

    iscsiadm -m node -T <target> -p <ip:port> -o update -n node.session.timeo.replacement_timeout -v 400

“`iscsiadm -m session -P 3`” output is shown below:

    <<snippet>>
    Iface Initiatorname: iqn.1993–08.org.debian:01:9b16db669dce
    Iface IPaddress: 10.142.0.2
    Iface HWaddress: <empty>
    Iface Netdev: <empty>
    SID: 14
    iSCSI Connection State: LOGGED IN
    iSCSI Session State: LOGGED_IN
    Internal iscsid Session State: NO CHANGE
    *********
    Timeouts:
    *********
    Recovery Timeout: 400
    Target Reset Timeout: 30
    LUN Reset Timeout: 30
    Abort Timeout: 15
    ************************
    Attached SCSI devices:
    ************************
    Host Number: 1 State: running
    scsi1 Channel 00 Id 0 Lun: 0
    Attached scsi disk sdc State: running
    <<snippet>>
    

You may notice the change in the “`Attached scsi disk`” value. This causes the volume to become unmounted and, therefore, needs to be remounted.

If you are aware of the iSCSI target login process, you likely know that it is a two-step process. The first step is to discover the target, and the second step is to log into the target. The “iscsiadm -o update” command can also be used after discovering the target but before logging into the target. Updating the setting in this way means that you do not need to remount the volume, as the login didn’t happen before the “iscsiadm -o update” command.

Below are the kernel logs related to the case where the iSCSI target is brought down and brought back before 400 seconds:

    Aug 29 11:31:37 instance-1 kernel: [19293.450614] connection12:0: detected conn error (1020)
    Aug 29 11:31:38 instance-1 iscsid: Kernel reported iSCSI connection 12:0 error (1020 — ISCSI_ERR_TCP_CONN_CLOSE: TCP connection closed) state (3)
    Aug 29 11:31:41 instance-1 iscsid: connect to 10.142.0.2:3260 failed (Connection refused)
    Aug 29 11:32:26 instance-1 iscsid: message repeated 12 times: [ connect to 10.142.0.2:3260 failed (Connection refused)]
    Aug 29 11:32:29 instance-1 iscsid: connect to 10.142.0.2:3260 failed (Connection refused)
    Aug 29 11:32:37 instance-1 iscsid: message repeated 2 times: [ connect to 10.142.0.2:3260 failed (Connection refused)]
    Aug 29 11:36:38 instance-1 iscsid: connection12:0 is operational after recovery (79 attempts)

Superb!!!

As you can see in the above logs, the iSCSI connection was successful even after 300 seconds. The mount point did not go into RO state, and thus the application container will remain in the `Running` state. This avoids a lot of manual work for the user.

**What about cases when the iSCSI login is already done, and the volume mountpoint can’t be remounted?**

One way to do this is by modifying the content of a file in the `/sys/class/iscsi_session/` directory path, from which the iSCSI initiator reads this setting.

The file related to this setting is as follows:

    /sys/class/iscsi_session/session<session_id>/recovery_tmo

“iscsiadm -m session -P 3” provides the session ID related to iSCSI login. It will be the “SID” parameter under the “Interface” section. For the previous output, the file to change is:

    /sys/class/iscsi_session/session14/recovery_tmo

Execute this command to run as a root to modify this setting within the file:

    echo 400 > /sys/class/iscsi_session/session<session_id>/recovery_tmo

**Conclusion**: When Kubernetes takes time in rescheduling the iSCSI target pod into a different node, modifying this setting in any of the above methods prevents the mount point from entering the RO state.

**There is one “gotcha”**: If multipathing is enabled, the multipath-related setting takes precedence over this setting if the setting modification is done either through the iscsid.conf file or “iscsiadm -o output” command.
