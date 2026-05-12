---
title: cleaning up kernels from your ubuntu
categories: linux 
directory: linux
excerpt: My experience of removing a kernel version and how to
tags:
comments: true
share: true
date: "2016-03-19T08:26:29+05:45"
category: ['code-quality']
cover: "/images/blog/blog-image-12.jpg"
thumb: "/images/blog/sm/blog-image-4.jpg"
show_category_hero_image: false
---

Why would anyone want to do that?

Well I now have a reason, My laptop running Ubuntu 14.04 suddenly started crashing. On 15th March it crashed more than 10 times.

I tried to figure out what had happened to my normally functioning machine all of a sudden. I had installed regular update early in the morning that day. Turns out that, I had updated my kernel to 3.13.0-83. That was only software installed that day, and if my laptop was crashing for software reasons there was only one possible culprit!

Thus I rebooted my machine, and selected older kernel version from my grub menu to start ubuntu. It worked normally.

Now I was sure my new linux kernel was giving all the problems, I had to uninstall it.
Here is how I did that:

**Step 1: List all the kernels installed in the system**

~~~sh
$ dpkg --list | grep linux-image

ii  linux-image-3.13.0-24-generic                         3.13.0-24.47                                        amd64        Linux kernel image for version 3.13.0 on 64 bit x86 SMP
ii  linux-image-3.13.0-83-generic                         3.13.0-83.127                                       amd64        Linux kernel image for version 3.13.0 on 64 bit x86 SMP
rc  linux-image-4.4.0-13-generic                          4.4.0-13.29~14.04.1                                 amd64        Linux kernel image for version 4.4.0 on 64 bit x86 SMP
ii  linux-image-extra-3.13.0-24-generic                   3.13.0-24.47                                        amd64        Linux kernel extra modules for version 3.13.0 on 64 bit x86 SMP
ii  linux-image-extra-3.13.0-83-generic                   3.13.0-83.127                                       amd64        Linux kernel extra modules for version 3.13.0 on 64 bit x86 SMP
ii  linux-image-generic                                   3.13.0.83.89                                        amd64        Generic Linux kernel image

~~~
**Step 2: Remove kernel you don't want anymore**

<BlogDetailsNoticeWrapper class="notice block">
Okay, before moving further! If you are trying to do something like this please make sure you don't remove all your kernels. Leave atleast one: probably the one that works for you. In my case I wanted to keep 3.13.0-24.
</BlogDetailsNoticeWrapper>

I removed buggy kernel version 3.13.0-83.

~~~sh
$ sudo apt-get purge linux-image-3.13.0-83-generic
~~~
Here is the output I could see in my screen when I removed my kernel:

~~~sh
Reading package lists... Done
Building dependency tree       
Reading state information... Done
The following packages were automatically installed and are no longer required:
  kde-l10n-engb libechonest2.1 libqtweetlib1.0
Use 'apt-get autoremove' to remove them.
The following packages will be REMOVED:
  linux-generic* linux-image-3.13.0-83-generic*
  linux-image-extra-3.13.0-83-generic* linux-image-generic*
0 upgraded, 0 newly installed, 4 to remove and 0 not upgraded.
After this operation, 195 MB disk space will be freed.
Do you want to continue? [Y/n] Y
(Reading database ... 207828 files and directories currently installed.)
Removing linux-generic (3.13.0.83.89) ...
Removing linux-image-generic (3.13.0.83.89) ...
Removing linux-image-extra-3.13.0-83-generic (3.13.0-83.127) ...
run-parts: executing /etc/kernel/postinst.d/apt-auto-removal 3.13.0-83-generic /boot/vmlinuz-3.13.0-83-generic
run-parts: executing /etc/kernel/postinst.d/initramfs-tools 3.13.0-83-generic /boot/vmlinuz-3.13.0-83-generic
update-initramfs: Generating /boot/initrd.img-3.13.0-83-generic
run-parts: executing /etc/kernel/postinst.d/pm-utils 3.13.0-83-generic /boot/vmlinuz-3.13.0-83-generic
run-parts: executing /etc/kernel/postinst.d/update-notifier 3.13.0-83-generic /boot/vmlinuz-3.13.0-83-generic
run-parts: executing /etc/kernel/postinst.d/zz-update-grub 3.13.0-83-generic /boot/vmlinuz-3.13.0-83-generic
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-3.13.0-83-generic
Found initrd image: /boot/initrd.img-3.13.0-83-generic
Found linux image: /boot/vmlinuz-3.13.0-24-generic
Found initrd image: /boot/initrd.img-3.13.0-24-generic
Found memtest86+ image: /boot/memtest86+.elf
Found memtest86+ image: /boot/memtest86+.bin
done
Purging configuration files for linux-image-extra-3.13.0-83-generic (3.13.0-83.127) ...
Removing linux-image-3.13.0-83-generic (3.13.0-83.127) ...
Examining /etc/kernel/postrm.d .
run-parts: executing /etc/kernel/postrm.d/initramfs-tools 3.13.0-83-generic /boot/vmlinuz-3.13.0-83-generic
update-initramfs: Deleting /boot/initrd.img-3.13.0-83-generic
run-parts: executing /etc/kernel/postrm.d/zz-update-grub 3.13.0-83-generic /boot/vmlinuz-3.13.0-83-generic
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-3.13.0-24-generic
Found initrd image: /boot/initrd.img-3.13.0-24-generic
Found memtest86+ image: /boot/memtest86+.elf
Found memtest86+ image: /boot/memtest86+.bin
done
The link /vmlinuz is a damaged link
Removing symbolic link vmlinuz 
 you may need to re-run your boot loader[grub]
The link /initrd.img is a damaged link
Removing symbolic link initrd.img 
 you may need to re-run your boot loader[grub]
Purging configuration files for linux-image-3.13.0-83-generic (3.13.0-83.127) ...
Examining /etc/kernel/postrm.d .
run-parts: executing /etc/kernel/postrm.d/initramfs-tools 3.13.0-83-generic /boot/vmlinuz-3.13.0-83-generic
run-parts: executing /etc/kernel/postrm.d/zz-update-grub 3.13.0-83-generic /boot/vmlinuz-3.13.0-83-generic
~~~

**Step 3: restart your system**

~~~sh
sudo reboot
~~~
