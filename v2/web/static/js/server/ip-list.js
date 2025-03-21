$(function () {
    load_portscan_config();
    //搜索
    $("#search").click(function () {
        $("#hidden_org_id").val($("#select_org_id_search").val())
        $("#ip_table").DataTable().draw(true);
    });
    $('#ip_table').on('draw.dt', function () {
        //alert('Table redrawn');
    });
    //新建任务窗口
    $("#create_task").click(function () {
        var checkIP = [];
        $('#ip_table').DataTable().$('input[type=checkbox]:checked').each(function (i) {
            checkIP[i] = $(this).val().split("|")[1];
        });
        $('#text_target').val(checkIP.join("\n"));
        $('#newTask').modal('toggle');
    });
    //XSCAN窗口
    $("#create_xscan_task").click(function () {
        var checkIP = [];
        $('#ip_table').DataTable().$('input[type=checkbox]:checked').each(function (i) {
            checkIP[i] = $(this).val().split("|")[1];
        });
        $('#text_target_xscan').val(checkIP.join("\n"));
        $('#newXScan').modal('toggle');
        load_pocfile_list();
    });
    //导入本地扫描结果窗口
    $("#import_portscan").click(function () {
        $('#importPortscan').modal('toggle');
    });
    $("#block_ip").click(function () {
        swal({
                title: "确定要一键拉黑选定的IP吗?",
                text: "该操作会将IP加入到黑名单列表中，同时从数据库中删除IP，以及IP关联的域名！",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确认",
                cancelButtonText: "取消",
                closeOnConfirm: true
            },
            function () {
                $('#ip_table').DataTable().$('input[type=checkbox]:checked').each(function (i) {
                    let id = $(this).val().split("|")[0];
                    $.ajax({
                        type: 'post',
                        url: 'ip-block?id=' + id,
                        success: function (data) {
                        },
                        error: function (xhr, type) {
                        }
                    });
                });
                $('#ip_table').DataTable().draw(false);
            });
    });
    $("#start_import").click(function () {
        var formData = new FormData();
        formData.append('file', $('#file')[0].files[0]);
        formData.append('bin', $('#select_portscan_bin').val());
        formData.append("org_id", $('#select_import_org_id_task').val());
        $.ajax({
            url: '/ip-import-portscan',
            type: 'POST',
            cache: false,
            data: formData,
            processData: false,
            contentType: false
        }).done(function (res) {
            if (res['status'] == "success") {
                swal({
                        title: "导入成功！",
                        text: res['msg'],
                        type: "success",
                        confirmButtonText: "确定",
                        confirmButtonColor: "#41b883",
                        closeOnConfirm: true,
                    },
                    function () {
                        $('#importPortscan').modal('hide');
                    });
            } else {
                swal('Warning', '导入失败！' + res['msg'], 'error');
            }
        }).fail(function (res) {
            swal('Warning', '导入失败！' + res['msg'], 'error');
        });
    })
    //执行新建任务Button
    $("#start_task").click(function () {
        const target = $('#text_target').val();
        if (!target) {
            swal('Warning', '请至少输入一个Target', 'error');
            return;
        }
        if (target.length > 5000) {
            swal('Warning', '目标Targets长度不能超过5000', 'error');
            return;
        }
        let cron_rule = "";
        if ($('#checkbox_cron_task').is(":checked")) {
            cron_rule = $('#input_cron_rule').val();
            if (!cron_rule) {
                swal('Warning', '请输入定时任务规则', 'error');
                return;
            }
        }
        if (getCurrentTabIndex('#nav_tabs') == 0) {
            const port = $('#input_port').val();
            const rate = $('#input_rate').val();
            let exclude_ip = "";
            if ($('#checkbox_exclude').is(":checked")) {
                exclude_ip = $('#input_exclude').val();
            }
            $.post("/task-start-portscan",
                {
                    "target": target,
                    "port": port,
                    'rate': rate,
                    'portscan': $('#checkbox_portscan').is(":checked"),
                    'nmap_tech': $('#select_tech').val(),
                    'bin': $('#select_bin').val(),
                    'org_id': $('#select_org_id_task').val(),
                    'iplocation': $('#checkbox_iplocation').is(":checked"),
                    'ping': $('#checkbox_ping').is(":checked"),
                    'fofasearch': $('#checkbox_fofasearch').is(":checked"),
                    'quakesearch': $('#checkbox_quakesearch').is(":checked"),
                    'huntersearch': $('#checkbox_huntersearch').is(":checked"),
                    'taskmode': $('#select_taskmode').val(),
                    'httpx': $('#checkbox_httpx').is(":checked"),
                    'exclude': exclude_ip,
                    'screenshot': $('#checkbox_screenshot').is(":checked"),
                    'fingerprinthub': $('#checkbox_fingerprinthub').is(":checked"),
                    'iconhash': $('#checkbox_iconhash').is(":checked"),
                    'fingerprintx': $('#checkbox_fingerprintx').is(":checked"),
                    'taskcron': $('#checkbox_cron_task').is(":checked"),
                    'cronrule': cron_rule,
                    'croncomment': $('#input_cron_comment').val(),
                    'load_opened_port': $('#checkbox_ip_load_opened_port').is(":checked"),
                    'ignoreoutofchina': $('#checkbox_ignorecdn_outofchina').is(":checked"),
                    'ignorecdn': $('#checkbox_ignorecdn_outofchina').is(":checked"),
                    'proxy': $('#checkbox_proxy').is(":checked"),
                }, function (data, e) {
                    if (e === "success" && data['status'] == 'success') {
                        swal({
                                title: "新建任务成功！",
                                text: "TaskId:" + data['msg'],
                                type: "success",
                                confirmButtonText: "确定",
                                confirmButtonColor: "#41b883",
                                closeOnConfirm: true,
                            },
                            function () {
                                $('#newTask').modal('hide');
                            });
                    } else {
                        swal('Warning', "添加任务失败! " + data['msg'], 'error');
                    }
                });
        }
        if (getCurrentTabIndex('#nav_tabs') == 1) {
            if ($('#checkbox_xray').is(":checked") == false && $('#checkbox_nuclei').is(":checked") == false && $('#checkbox_goby').is(":checked") == false) {
                swal('Warning', '请选择要使用的验证工具！', 'error');
                return;
            }
            if ($('#checkbox_nuclei').is(":checked")) {
                if ($('#input_nuclei_poc_file').val() == '') {
                    swal('Warning', '请选择poc file', 'error');
                    return;
                }
            }
            $.post("/task-start-vulnerability",
                {
                    "target": target,
                    'xrayverify': $('#checkbox_xray').is(":checked"),
                    'xray_poc_file': $('#select_poc_type') + "|" + $('#input_xray_poc_file').val(),
                    'nucleiverify': $('#checkbox_nuclei').is(":checked"),
                    'nuclei_poc_file': $('#input_nuclei_poc_file').val(),
                    'gobyverify': $('#checkbox_goby').is(":checked"),
                    'load_opened_port': $('#checkbox_load_opened_port').is(":checked"),
                    'taskcron': $('#checkbox_cron_task').is(":checked"),
                    'cronrule': cron_rule,
                    'croncomment': $('#input_cron_comment').val(),
                    'proxy': $('#checkbox_proxy').is(":checked"),
                }, function (data, e) {
                    if (e === "success" && data['status'] == 'success') {
                        swal({
                                title: "新建任务成功！",
                                text: "TaskId:" + data['msg'],
                                type: "success",
                                confirmButtonText: "确定",
                                confirmButtonColor: "#41b883",
                                closeOnConfirm: true,
                            },
                            function () {
                                $('#newTask').modal('hide');
                            });
                    } else {
                        swal('Warning', "添加任务失败! " + data['msg'], 'error');
                    }
                });
        }
        if (getCurrentTabIndex('#nav_tabs') == 2) {
            const port1 = $('#input_batchscan_port1').val();
            const port2 = $('#input_batchscan_port2').val();
            const rate = $('#input_batchscan_rate').val();
            let exclude_ip = "";
            if ($('#checkbox_batchscan_exclude').is(":checked")) {
                exclude_ip = $('#input_batchscan_exclude').val();
            }
            $.post("/task-start-batchscan",
                {
                    "target": target,
                    "port": port1 + "|" + port2,
                    'rate': rate,
                    'portscan': true,
                    'nmap_tech': $('#select_batchscan_tech').val(),
                    'bin': $('#select_batchscan_bin').val(),
                    'org_id': $('#select_batchscan_org_id_task').val(),
                    'iplocation': true,
                    'ping': $('#checkbox_batchscan_ping').is(":checked"),
                    'fofasearch': false,
                    'quakesearch': false,
                    'huntersearch': false,
                    'taskmode': $('#select_batchscan_taskmode').val(),
                    'httpx': $('#checkbox_batchscan_httpx').is(":checked"),
                    'exclude': exclude_ip,
                    'screenshot': $('#checkbox_batchscan_screenshot').is(":checked"),
                    'fingerprinthub': $('#checkbox_batchscan_fingerprinthub').is(":checked"),
                    'iconhash': $('#checkbox_batchscan_iconhash').is(":checked"),
                    'fingerprintx': $('#checkbox_batchscan_fingerprintx').is(":checked"),
                    'taskcron': $('#checkbox_cron_task').is(":checked"),
                    'cronrule': cron_rule,
                    'croncomment': $('#input_cron_comment').val(),
                    'proxy': $('#checkbox_proxy').is(":checked"),
                }, function (data, e) {
                    if (e === "success" && data['status'] == 'success') {
                        swal({
                                title: "新建任务成功！",
                                text: "TaskId:" + data['msg'],
                                type: "success",
                                confirmButtonText: "确定",
                                confirmButtonColor: "#41b883",
                                closeOnConfirm: true,
                            },
                            function () {
                                $('#newTask').modal('hide');
                            });
                    } else {
                        swal('Warning', "添加任务失败! " + data['msg'], 'error');
                    }
                });
        }
    });


    $("#start_xscan_task").click(function () {
        const formData = new FormData();
        if (getCurrentTabIndex('#nav_tabs_xscan') === 0) {
            const target = $('#text_target_xscan').val();
            if (!target) {
                swal('Warning', '请至少输入一个Target', 'error');
                return;
            }
            if (target.length > 5000) {
                swal('Warning', '目标Targets长度不能超过5000', 'error');
                return;
            }
            formData.append("xscan_type", "xportscan");
            formData.append("target", target);
            formData.append("onlineapi", $('#checkbox_onlineapi_xscan').is(":checked"));
            formData.append("port", $('#input_port_xscan').val());
        } else if (getCurrentTabIndex('#nav_tabs_xscan') === 2) {
            const target = $('#text_target_onlineapi_xscan').val();
            if (!target) {
                swal('Warning', '请输入查询的语法', 'error');
                return;
            }
            if (target.length > 5000) {
                swal('Warning', 'Targets长度不能超过5000', 'error');
                return;
            }
            formData.append("xscan_type", "xonlineapi");
            formData.append("target", target);
            formData.append("onlineapi_engine", $('#select_onlineapi_engine_xscan').val())
        } else {
            if ($('#select_org_id_task_xscan').val() === "") {
                swal('Warning', '必须选择要执行任务的组织！', 'error');
                return
            }
            formData.append("xscan_type", "xorgipscan");
            formData.append("port", $('#input_port_org_xscan').val());
        }
        let cron_rule = "";
        if ($('#checkbox_cron_task_xscan').is(":checked")) {
            cron_rule = $('#input_cron_rule_xscan').val();
            if (!cron_rule) {
                swal('Warning', '请输入定时任务规则', 'error');
                return;
            }
        }

        formData.append("org_id", $('#select_org_id_task_xscan').val());
        formData.append("fingerprint", $('#checkbox_fingerpint_xscan').is(":checked"));

        formData.append("xraypoc", $('#checkbox_xraypoc_xscan').is(":checked"));
        formData.append("xraypocfile", $('#select_xray_poc_type_xscan').val() + "|" + $('#input_xray_poc_file_xscan').val());
        formData.append("nucleipoc", $('#checkbox_nucleipoc_xscan').is(":checked"));
        formData.append("nucleipocfile", $('#input_nuclei_poc_file_xscan').val());
        formData.append("gobypoc", $('#checkbox_gobypoc_xscan').is(":checked"));

        formData.append("taskcron", $('#checkbox_cron_task_xscan').is(":checked"));
        formData.append("cronrule", cron_rule);
        formData.append("croncomment", $('#input_cron_comment_xscan').val());
        formData.append("proxy", $('#checkbox_proxy_xscan').is(":checked"));

        if ((formData.get("nucleipoc") === "true" || formData.get("gobypoc") === "true" || formData.get("xraypoc") === "true") && formData.get("fingerprint") === "false") {
            swal('Warning', '漏洞扫描需要开启指纹扫描步骤选项', 'error');
            return;
        }
        $.ajax({
            url: '/task-start-xscan',
            type: 'POST',
            cache: false,
            data: formData,
            processData: false,
            contentType: false
        }).done(function (res) {
            if (res['status'] == "success") {
                swal({
                        title: "新建任务成功！",
                        text: res['msg'],
                        type: "success",
                        confirmButtonText: "确定",
                        confirmButtonColor: "#41b883",
                        closeOnConfirm: true,
                    },
                    function () {
                        $('#newXScan').modal('hide');
                    });
            } else {
                swal('Warning', '新建任务失败！' + res['msg'], 'error');
            }
        }).fail(function (res) {
            swal('Warning', '新建任务失败！' + res['msg'], 'error');
        });
    });

    $("#checkbox_portscan").click(function () {
        if (this.checked) {
            $("#input_port").prop("disabled", false);
            $("#select_tech").prop("disabled", false);
            $("#select_bin").prop("disabled", false);
            $("#input_rate").prop("disabled", false);
            $("#checkbox_ping").prop("disabled", false);
            $("#checkbox_exclude").prop("disabled", false);
            $("#input_exclude").prop("disabled", false);
        } else {
            $("#input_port").prop("disabled", true);
            $("#select_tech").prop("disabled", true);
            $("#select_bin").prop("disabled", true);
            $("#input_rate").prop("disabled", true);
            $("#checkbox_ping").prop("disabled", true);
            $("#checkbox_exclude").prop("disabled", true);
            $("#input_exclude").prop("disabled", true);

        }
    })
    $("#checkbox_cron_task").click(function () {
        if (this.checked) {
            $("#input_cron_rule").prop("disabled", false);
            $("#input_cron_comment").prop("disabled", false);
            $("#label_cron_rule").prop("disabled", false);
        } else {
            $("#input_cron_rule").prop("disabled", true);
            $("#input_cron_comment").prop("disabled", true);
            $("#label_cron_rule").prop("disabled", true);
        }
    })
    $("#checkbox_cron_task_xscan").click(function () {
        if (this.checked) {
            $("#input_cron_rule_xscan").prop("disabled", false);
            $("#input_cron_comment_xscan").prop("disabled", false);
            $("#label_cron_rule_xscan").prop("disabled", false);
        } else {
            $("#input_cron_rule_xscan").prop("disabled", true);
            $("#input_cron_comment_xscan").prop("disabled", true);
            $("#label_cron_rule_xscan").prop("disabled", true);
        }
    })
    $("#ip_export").click(function () {
        let url = 'ip-export?';
        url += get_export_options();

        window.open(url);
    });
    $("#ip_statistics").click(function () {
        let url = 'ip-statistics?';
        url += get_export_options();

        window.open(url);
    });
    $("#ip_memo_export").click(function () {
        let url = 'ip-memo-export?';
        url += get_export_options();

        window.open(url);
    });

    //批量删除
    $("#batch_delete").click(function () {
        batch_delete('#ip_table', '/ip-delete');
    });
    // workspace
    get_user_workspace_list();
    $('#select_workspace').change(function () {
        change_user_workspace('#ip_table');
    });
    $('#select_poc_type').change(function () {
        load_pocfile_list(true, false, $('#select_poc_type').val())
    });
    $('#select_xray_poc_type_xscan').change(function () {
        load_pocfile_list(true, false, $('#select_xray_poc_type_xscan').val())
    });
    //IP列表
    $('#ip_table').DataTable(
        {
            "paging": true,
            "serverSide": true,
            "autowidth": false,
            "sort": false,
            "pagingType": "full_numbers",//分页样式
            'iDisplayLength': 50,
            "dom": '<i><t><"bottom"lp>',
            "ajax": {
                "url": "/ip-list",
                "type": "post",
                "data": function (d) {
                    init_dataTables_defaultParam(d);
                    return $.extend({}, d, {
                        "org_id": $('#hidden_org_id').val(),
                        "domain_address": $('#domain_address').val(),
                        "ip_address": $('#ip_address').val(),
                        "port": $('#port').val(),
                        "content": $('#content').val(),
                        "iplocation": $('#iplocation').val(),
                        "port_status": $('#port_status').val(),
                        "color_tag": $('#select_color_tag').val(),
                        "memo_content": $('#memo_content').val(),
                        "date_delta": $('#date_delta').val(),
                        "create_date_delta": $('#create_date_delta').val(),
                        'disable_fofa': $('#checkbox_disable_fofa').is(":checked"),
                        'disable_banner': $('#checkbox_disable_banner').is(":checked"),
                        'disable_outof_china': $('#checkbox_disable_outof_china').is(":checked"),
                        'select_outof_china': $('#checkbox_select_outof_china').is(":checked"),
                        'select_no_openedport': $('#checkbox_select_no_openedport').is(":checked"),
                        'select_order_by_date': $('#checkbox_select_order_by_date').is(":checked"),
                        "ip_http": $('#http_content').val(),
                        "wiki_docs": $('#wiki_docs_content').val(),
                    });
                }
            },
            columns: [
                {
                    data: "id",
                    width: "5%",
                    className: "dt-body-center",
                    title: '<input  type="checkbox" class="checkall" />',
                    "render": function (data, type, row) {
                        let strData = '<input type="checkbox" class="checkchild" value="' + row['id'] + "|" + row['ip'] + '"/>';
                        return strData;
                    }
                },
                {
                    data: "index", title: "序号", width: "5%",
                    "render": function (data, type, row, meta) {
                        let strData = data;
                        if (row["pinindex"] === 1) strData = '<i class="fa fa-thumb-tack fa-rotate-90" style="color: orange" title="已置顶"></i>';
                        if (row["honeypot"].length > 0) strData = "<span style='color:red;font-weight:bold' title='" + row["honeypot"] + "'>蜜罐</span>";
                        return strData;
                    }
                },
                {
                    data: "ip",
                    title: "IP地址",
                    width: "10%",
                    render: function (data, type, row, meta) {
                        let strData = "";
                        let disable_fofa = $('#checkbox_disable_fofa').is(":checked");
                        if (row['color_tag']) {
                            strData += '<h5><a href="/ip-info?workspace=' + row['workspace'] + '&&ip=' + data + '&&disable_fofa=' + disable_fofa + '" target="_blank" class="badge ' + row['color_tag'] + '">' + data + '</a></h5>';
                        } else {
                            strData += '<a href="/ip-info?workspace=' + row['workspace'] + '&&ip=' + data + '&&disable_fofa=' + disable_fofa + '" target="_blank">' + data + '</a>';
                        }
                        if (row['memo_content']) {
                            strData += '&nbsp;<i class="fa fa-flag" style="color:  darkorange" title="' + html2Escape(row['memo_content']) + '"></i>';
                        }
                        if (row['wiki_docs']) {
                            strData += '&nbsp;<i class="fa fa-archive" style="color: darkorange" title="' + html2Escape(row['wiki_docs']) + '"></i>';
                        }
                        if (row['vulnerability']) {
                            strData += '&nbsp;<span class="badge badge-danger" data-toggle="tooltip" data-html="true" title="' + html2Escape(row['vulnerability']) + '"><i class="fa fa-bolt"></span>';
                        }
                        return strData;
                    }
                },
                {
                    data: "location", title: "归属地", width: "12%",
                    render: function (data, type, row, meta) {
                        let strData = data;
                        if (row["cdn"]) {
                            strData += "&nbsp;<span class=\"badge badge-pill badge-warning\" title=\"IP可能使用了CDN\">CDN</span>\n";
                        }
                        return strData;
                    }
                },
                {
                    data: "port", title: "开放端口", width: "15%",
                    "render": function (data, type, row, meta) {
                        let strData = '<div style="width:100%;white-space:normal;word-wrap:break-word;word-break:break-all;">';
                        let pre_link = "";
                        let j = 0, len = data.length;
                        for (; j < len; j++) {
                            // 提取出端口和状态
                            const port = data[j].replace(/\[.+?]/g, "");
                            const status = data[j].replace(/^.+?\[/g, "");
                            strData += pre_link;
                            strData += '<a href="';
                            // ！！！这里不能用===比较
                            if (port == 443 || port == 8443) strData += "https";
                            else strData += 'http';
                            // 快速链接地址
                            strData += '://' + row['ipf'] + ':' + port + '" target="_blank">' + port + '</a>';
                            // 端口状态
                            if (status !== port) strData += "[" + status;

                            pre_link = ",";
                        }
                        strData += '</div>'
                        return strData;
                    }
                },
                {
                    data: "banner", title: "Icon | Title | Finger | Banner", width: "25%",
                    "render": function (data, type, row, meta) {
                        let icons = '';
                        for (let i in row['iconimage']) {
                            icons += '<img src=/webfiles/' + row['workspace_guid'] + '/iconimage/' + row['iconimage'][i] + ' width="24px" height="24px"/>&nbsp;';
                        }
                        if (icons !== "") icons += "<br>";
                        let title_array = [];
                        for (let key of Object.keys(row['title'])) {
                            title_array.push(key)
                        }
                        let titles_all = title_array.toString();
                        let title = encodeHtml(titles_all.substr(0, 200));
                        if (titles_all.length > 200) title += '......';
                        if (title !== "") title += "<br>";

                        let finger_array = [];
                        for (let key of Object.keys(row['finger'])) {
                            finger_array.push(key)
                        }
                        let fingers_all = finger_array.toString();
                        let finger = encodeHtml(fingers_all.substr(0, 200));
                        if (fingers_all.length > 200) finger += '......';
                        if (finger !== "") finger += "<br>";

                        let banner_array = [];
                        for (let key of Object.keys(row['banner'])) {
                            banner_array.push(key)
                        }
                        let banner_all = banner_array.toString();
                        let banner = encodeHtml(banner_all.substr(0, 200));
                        if (banner_all.length > 200) banner += '......';
                        return '<div style="width:100%;white-space:normal;word-wrap:break-word;word-break:break-all;">' + icons + title + finger + banner + '</div>';
                    }
                },
                {
                    data: "screenshot", title: "ScreenShot", width: "20%",
                    "render": function (data, type, row, meta) {
                        let title = '';
                        let index = 0;
                        for (let i in data) {
                            index++;
                            if (index > 5) {
                                let disable_fofa = $('#checkbox_disable_fofa').is(":checked");
                                title += '<a href=/ip-info?workspace=' + row['workspace'] + '&&ip=' + row['ip'] + '&&disable_fofa=' + disable_fofa + ' target="_blank">' + '<img src="/static/images/more.png" class="img"  style="margin-bottom: 5px;margin-left: 5px;" title="点击查看更多" /></a>';
                                break;
                            }
                            let thumbnailFile = data[i].replace('.png', '_thumbnail.png');
                            let imgTitle = data[i].replace(".png", "").replace("_", ":");
                            title += '<img src="/webfiles/' + row['workspace_guid'] + '/screenshot/' + row['ip'] + '/' + thumbnailFile + '" class="img"  style="margin-bottom: 5px;margin-left: 5px;" title="' + imgTitle + '" onclick="show_bigpic(\'/webfiles/' + row['workspace_guid'] + '/screenshot/' + row['ip'] + '/' + data[i] + '\')"/>'
                        }
                        return '<div style="width:100%;white-space:normal;word-wrap:break-word;word-break:break-all;">' + title + '</div>';
                    }
                },
            ],
            infoCallback: function (settings, start, end, max, total, pre) {
                return "共<b>" + total + "</b>条记录，当前显示" + start + "到" + end + "记录";
            },
            drawCallback: function (setting) {
                if ($('#checkbox_select_statistic').is(":checked")) {
                    process_statistic_data_ip(setting);
                    process_statistic_data_port(setting);
                    process_statistic_data_icon(setting);
                    process_statistic_data_location(setting);
                    process_statistic_data_title(setting);
                    process_statistic_data_banner(setting);
                    $('#div_show_statistic').attr("style", "display:block");
                } else {
                    $('#div_show_statistic').attr("style", "display:none");
                }
                const _this = $(this);
                const tableId = _this.attr('id');
                const pageDiv = $('#' + tableId + '_paginate');
                pageDiv.append(
                    '<a class="paginate_button" href="#divTop">UP</a>' +
                    '<i class="fa fa-arrow-circle-o-right fa-lg" aria-hidden="true"></i><input id="' + tableId + '_gotoPage" type="text" style="height:20px;line-height:20px;width:40px;"/>' +
                    '<a class="paginate_button" aria-controls="' + tableId + '" tabindex="0" id="' + tableId + '_goto">GO</a>')
                $('#' + tableId + '_goto').click(function (obj) {
                    let page = $('#' + tableId + '_gotoPage').val();
                    const thisDataTable = $('#' + tableId).DataTable();
                    const pageInfo = thisDataTable.page.info();
                    if (isNaN(page)) {
                        $('#' + tableId + '_gotoPage').val('');
                    } else {
                        const maxPage = pageInfo.pages;
                        page = Number(page) - 1;
                        if (page < 0) {
                            page = 0;
                        } else if (page >= maxPage) {
                            page = maxPage - 1;
                        }
                        $('#' + tableId + '_gotoPage').val(page + 1);
                        thisDataTable.page(page).draw('page');
                    }
                })
            }
        }
    );//end datatable
});


function process_statistic_data_ip(setting) {
    let obj_map = new Map()
    for (const data of setting.json.data) {
        if (isIpv4(data.ip)) {
            let ip_Nums = data.ip.split(".")
            if ((ip_Nums.length) === 4) {
                const ip_C = ip_Nums[0] + "." + ip_Nums[1] + "." + ip_Nums[2] + ".0/24";
                if (obj_map.has(ip_C)) {
                    obj_map.set(ip_C, obj_map.get(ip_C) + 1)
                } else {
                    obj_map.set(ip_C, 1)
                }
            }
        } else if (isIpv6(data.ip)) {
            const ip_C = getIPv6CSubnet(data.ip)
            if (obj_map.has(ip_C)) {
                obj_map.set(ip_C, obj_map.get(ip_C) + 1)
            } else {
                obj_map.set(ip_C, 1)
            }

        }
    }
    $('#statistic_ip').html(get_result_output(obj_map, 42));
}

function process_statistic_data_port(setting) {
    let obj_map = new Map()
    for (const data of setting.json.data) {
        let j = 0, len = data.port.length;
        for (; j < len; j++) {
            //提取出端口
            const port = data.port[j].replace(/\[.+?]/g, "");
            if (obj_map.has(port)) {
                obj_map.set(port, obj_map.get(port) + 1)
            } else {
                obj_map.set(port, 1)
            }
        }
    }
    $('#statistic_port').html(get_result_output(obj_map));
}

function process_statistic_data_icon(setting) {
    let obj_map = new Map()
    for (const data of setting.json.data) {
        for (let i in data.iconimage) {
            let icon = '<img src=/webfiles/' + data.workspace_guid + '/iconimage/' + data.iconimage[i] + ' width="24px" height="24px"/>';
            if (obj_map.has(icon)) {
                obj_map.set(icon, obj_map.get(icon) + 1)
            } else {
                obj_map.set(icon, 1)
            }
        }
    }
    $('#statistic_icon').html(get_result_output(obj_map, 0));
}

function process_statistic_data_title(setting) {
    let obj_map = new Map()

    for (const data of setting.json.data) {
        for (let title of Object.keys(data['title'])) {
            if (obj_map.has(title)) {
                obj_map.set(title, obj_map.get(title) + data['title'][title])
            } else {
                obj_map.set(title, 1)
            }
        }
    }
    $('#statistic_title').html(get_result_output(obj_map));
}

function process_statistic_data_banner(setting) {
    let obj_map = new Map()

    for (const data of setting.json.data) {
        for (let banner of Object.keys(data['banner'])) {
            if (obj_map.has(banner)) {
                obj_map.set(banner, obj_map.get(banner) + data['banner'][banner])
            } else {
                obj_map.set(banner, 1)
            }
        }
    }
    $('#statistic_banner').html(get_result_output(obj_map, 20));
}

function process_statistic_data_location(setting) {
    let obj_map = new Map()
    for (const data of setting.json.data) {
        const location = data.location
        if (obj_map.has(location)) {
            obj_map.set(location, obj_map.get(location) + 1)
        } else {
            obj_map.set(location, 1)
        }
    }
    $('#statistic_location').html(get_result_output(obj_map));
}


function get_export_options() {
    let url = '';
    url += 'org_id=' + encodeURI($('#select_org_id_search').val());
    url += '&domain_address=' + encodeURI($('#domain_address').val());
    url += '&ip_address=' + encodeURI($('#ip_address').val());
    url += '&port=' + encodeURI($('#port').val());
    url += '&content=' + encodeURI($('#content').val());
    url += '&iplocation=' + encodeURI($('#iplocation').val());
    url += '&port_status=' + encodeURI($('#port_status').val());
    url += '&color_tag=' + encodeURI($('#select_color_tag').val());
    url += '&memo_content=' + encodeURI($('#memo_content').val());
    url += '&date_delta=' + encodeURI($('#date_delta').val());
    url += '&disable_fofa=' + encodeURI($('#checkbox_disable_fofa').is(":checked"));
    url += '&create_date_delta=' + encodeURI($('#create_date_delta').val());
    url += '&ip_http=' + encodeURI($('#http_content').val());
    url += '&select_order_by_date=' + encodeURI($('#checkbox_select_order_by_date').is(":checked"));

    return url;
}

function load_portscan_config() {
    $.post("/config-list", function (data) {
        //portscan
        $('#select_bin').val(data['cmdbin']);
        $('#input_port').val(data['port']);
        $('#select_tech').val(data['tech']);
        $('#input_rate').val(data['rate']);
        $('#checkbox_ping').prop("checked", data['ping']);
        $('#select_batchscan_bin').val(data['cmdbin']);
        $('#input_batchscan_port2').val(data['port']);
        $('#select_batchscan_tech').val(data['tech']);
        $('#input_batchscan_rate').val(data['rate']);
        $('#checkbox_batchscan_ping').prop("checked", data['ping']);
        // onlineapi
        $('#checkbox_fofasearch').prop("checked", data['fofa']);
        $('#checkbox_huntersearch').prop("checked", data['hunter']);
        $('#checkbox_quakesearch').prop("checked", data['quake']);
        $('#checkbox_ignorecdn_outofchina').prop("checked", data['ignorecdn']);
        //fingerprint
        $('#checkbox_httpx').prop("checked", data['httpx']);
        $('#checkbox_fingerprinthub').prop("checked", data['fingerprinthub']);
        $('#checkbox_screenshot').prop("checked", data['screenshot']);
        $('#checkbox_iconhash').prop("checked", data['iconhash']);
        $('#checkbox_batchscan_httpx').prop("checked", data['httpx']);
        $('#checkbox_batchscan_fingerprinthub').prop("checked", data['fingerprinthub']);
        $('#checkbox_batchscan_screenshot').prop("checked", data['screenshot']);
        $('#checkbox_batchscan_iconhash').prop("checked", data['iconhash']);
        $('#checkbox_batchscan_fingerprintx').prop("checked", data['fingerprintx']);
    });
}
