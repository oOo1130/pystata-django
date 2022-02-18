jQuery(function ($) {
  const $loading = $('#loadingDiv').hide();
  var table;
  var changedRows = [];

  $(document)
    .ajaxStart(function () {
      $loading.show();
    })
    .ajaxStop(function () {
      $loading.hide();
    });
  $(document).ready(function () {
    [...document.querySelectorAll('.filterTab')].forEach(el =>
      el.addEventListener('contextmenu', e => e.preventDefault())
    );

    var mainheight = $('.mycl').height();
    var tabheight = $('#myTab').height();
    var tabcontentheight = mainheight - tabheight - 90;
    $('#myTabContent').css('height', tabcontentheight);
  });

  $('.btn-command-shortcut').click(function () {
    var command = $(this).data("command");
    var old = $("#command_input").val();
    $("#command_input").val(old + (old == '' ? '' : ' ') + command);
  });

  $(document).on('click', '.btn-val-shortcut', function () {
    var variable = $(this).data("val");
    var old = $("#command_input").val();
    $("#command_input").val(old + (old == '' ? '' : ' ') + variable);
  })

  $("#race-tab").click();

  $(".date-range .date").datepicker();
  // datepicker end

  // Date filter apply start
  $('.btn-apply').click(function () {
    let date_from = $('input#date_from').val();
    let date_to = $('input#date_to').val();
    let data = [date_from, date_to];

    $.ajax({
      url: '/apply/',
      method: 'POST',
      data: JSON.stringify({ arr: data }),
      success: function (response) {
        console.log(response);
      },
      error: function (err) {
        console.error(err);
      }
    })
  });
  // Date filter apply end

  // Modal Full/Minimize Screen start

  $(document).on('click', '.full-screen', function () {
    $('.modal-header-button').empty();
    htmlContent = '';
    htmlContent = $('<button type="button" class="minimize-screen"><i class="bi bi-fullscreen-exit"></i></button>');
    htmlContent.appendTo($('.modal-header-button'));
    openFullscreen();
  });

  $(document).on('click', '.minimize-screen', function () {
    $('.modal-header-button').empty();
    htmlContent = '';
    htmlContent = $(' <button type="button" class="full-screen"><i class="bi bi-fullscreen"></i></button>');
    htmlContent.appendTo($('.modal-header-button'));
    closeFullscreen();
  });

  $(document).on('click', '.modalclose', function () {
    $('.modal-header-button').empty();
    htmlContent = '';
    htmlContent = $(' <button type="button" class="full-screen"><i class="bi bi-fullscreen"></i></button>');
    htmlContent.appendTo($('.modal-header-button'));
    closeFullscreen();
  });
  // Modal Full/Minimize Screen end

  // Graph Run button click start
  $(document).on('click', '.btn-run', function () {
    let sel_node_id = $(this).parents('.drawflow-node').attr('id').split('-')[1];
    let grp_data = editor.export();
    let input_conns = grp_data.drawflow.Home.data[sel_node_id].inputs.input_1.connections;
    if (input_conns.length >= 2 && input_conns.length <= 3) { // check if the node has 2 or 3 inputs
      let x = null;
      let y = null;
      let z = null;

      let n_data = editor.getNodeFromId(input_conns[0].node).data;
      if (n_data.type == TYPE_VAL) {
        x = n_data.name;
      }
      n_data = editor.getNodeFromId(input_conns[1].node).data;
      if (n_data.type == TYPE_VAL) {
        y = n_data.name;
      }

      if(input_conns.length == 3){
        n_data = editor.getNodeFromId(input_conns[2].node).data;
        if(n_data.type == TYPE_VAL) {
          z = n_data.name;
        }
      }

      if (x && y && !z) {
        $("#btn-graph-modal").click();
        draw_graph(x, y);
      }
      if (x && y && z){
        $("#btn-graph-modal").click();
        draw_3d_graph(x, y, z);
      }
    } else {
      $.alert({ title: 'Error', content: 'Wrong connections!' });
    }
  });
  // Graph Run button click end
  // Graph Run command button click start
  $(document).on('click', '.btn-run-command', function () {
    let sel_node_id = $(this).parents('.drawflow-node').attr('id').split('-')[1];
    let grp_data = editor.export();
    let sel_node = grp_data.drawflow.Home.data[sel_node_id];
    let input_conns = sel_node.inputs.input_1.connections;
    if (input_conns.length == 1) { // check if the node has 2 inputs
      let command = null;
      let n_data = editor.getNodeFromId(input_conns[0].node).data;
      if (n_data.type == TYPE_VAL) {
        command = sel_node.data['name'] + ' ' + n_data.name;
      }
      if (command) {
        run_command(command);
      }
    } else if (input_conns.length == 0) {
      let command = sel_node.data['name'];
      run_command(command);
    } else {
      $.alert({ title: 'Error', content: 'Wrong connections!' });
    }
  });
  // Graph Run command button click end

  // File upload button click
  // $(document).on('change', '.hiddenFileInput', function () {
  //   uploadFile();
  // });

  $(document).on('click', '.db-list-group .remove', function () {
    const db_id = $(this).data("id");
    const parentli = $(this).parent();

    $.confirm({
      title: 'Warning!',
      content: 'Are you sure to remove?',
      buttons: {
        yes: function () {
          $.ajax({
            url: "/remove_db/" + db_id,
            success: function (resp) {
              if (resp.result) {
                parentli.remove();
                let data = editor.export();
                const fname = resp.file_name;
                for (let key in data.drawflow.Home.data) {
                  if (data.drawflow.Home.data[key].name == fname) {
                    delete data.drawflow.Home.data[key];
                  }
                }
                editor.import(data);
              } else {
                $.alert({ title: 'Error', content: 'Removing Failed' });
              }
            }
          });
        },
        cancel: function () {
        },
      }
    });
  });

  // run command ajax form submit
  $("#command-form").submit(function () {
    if ($("#command_input").val() == "") {
      $.alert({ title: 'Warning', content: 'Please input a command.' });
      return false;
    }
    $.ajax({
      dataType: 'json',
      method: 'post',
      url: "/run_command/",
      data: $(this).serialize(),
      success: function (resp) {
        if (resp.result) {
          $("#stata-result").empty();
          $("#stata-result").text(resp.stata_result);
          $("#result-history").text($("#result-history").text() + "\n" + resp.stata_result);

          let new_item = $("<ul class='nav-item btn'><div class='row text-format'><div class='col-md-4'>" + resp.command.command + "</div><div class='col-md-4'>" + resp.command.time + "</div><div class='col-md-4'>" + resp.command.user + "</div></div></ul>")
          new_item.appendTo(".commandHistoryBar");
        } else {
          $.alert({ title: 'Error', content: 'No data returned!' });
        }
      },
      error: function (request, status, error) {
        $.alert({ title: 'Error', content: error });
      }
    });
    return false;
  });

  // Database file upload
  $(".db-upload-form").submit(function () {
    if ($("#fileupload").val() == "") {
      $.alert({ title: 'Warning', content: 'Please choose a file to upload' });
      return false;
    }
    uploadFile();
    return false;
  });

  // Save mainnet to file
  $("#save-mainnet").click(function () {
    const data = editor.export();
    const csrf = $("meta[name=X-CSRFToken]").attr("content");
    $.ajax({
      dataType: 'json',
      method: 'post',
      url: "/mainnet_upload/",
      data: { 'data': JSON.stringify(data), 'csrfmiddlewaretoken': csrf },
      success: function (resp) {
        if (resp.result) {
          $.alert({ title: 'Save', content: 'Main Net saved successfully' });
        } else {
          $.alert({ title: 'Error', content: 'No data returned!' });
        }
      },
      error: function (request, status, error) {
        $.alert({ title: 'Error', content: error });
      }
    });
  });

  var col_id = '';
  var row_id = '';
  var change_value = '';
  var thisPosition;
  // Save mainnet to file end
  $(document).on('click', '#databaseTable tbody tr td', function () {
    var $this = $(this);
    var cell = $(this)[0]["_DT_CellIndex"];
    var row_id = cell['row'];
    var column_id = cell['column'];
    col_id = column_id;

    var row = this.parentElement;

    if (!$('#databaseTable').hasClass("editing")) {
      $('#databaseTable').addClass("editing");
      var data = table.row(row).data();
      var $row = $(row);
      thisPosition = $row.find("td:nth-child(" + (column_id + 1) + ")");
      var thisPositionText = thisPosition.text();
      thisPosition.empty().append($("<input></input>", {
        "id": "Position_" + data[0],
        "class": "changePosition"
      }));
      $('.changePosition').focus();
      $("#Position_" + data[0]).val(thisPositionText)
    }
  });

  //remove DataTable Editing start
  $(document).on('blur', "#databaseTable tbody tr td", function () {
    var value = $("#databaseTable tbody input").val()
    thisPosition.empty().text(value);
    $('#databaseTable').removeClass("editing");
  });
  //remove DataTable Editing end

  $(document).on("change", " #databaseTable tbody .changePosition", function () {
    var $this = $(this);

    var $thisCell = table.cell($this.parents('td'));
    var tempData = table.row($this.closest("tr")).data();
    tempData[2] = $this.val();
    var row = table.row($this.closest("tr"));
    $this.parent("td").addClass('orange');
    $this.parent("td").empty().text($this.val());

    $('#databaseTable').removeClass("editing");

    var dict1 = {};
    var dict2 = {};

    row_id = tempData['row_num'];
    change_value = tempData[2];

    dict2[col_id] = change_value;
    dict1[row_id] = dict2;

    changedRows.push(dict1);

    table.buttons([1]).enable();

  });

  // database add tag click start
  let tag_db = '';
  $(document).on('click', '.databaseTagAdd', function () {
    let sel_node_id = $(this).parents('.drawflow-node').attr('id').split('-')[1];
    let n_data = editor.getNodeFromId(sel_node_id).data;
    let name = n_data.name;
    tag_db = name;
    $.ajax({
      url: '/get_columns/' + name,
      success: function (json) {
        if (json.result != true) return true;

        //modal header change start
        const newTitle = $('<h3 class="text-center text-format modal-title">' + tag_db + '</h3><div class="modal-header-button">\n' +
          '<button type="button" class="full-screen"><i class="bi bi-fullscreen"></i></button>\n' +
          '</div><button type="button" class="close modalclose" data-dismiss="modal">&times;</button>');
        $(".addtag-title").text("");
        newTitle.appendTo($(".addtag-title"));
        //modal header change end

        //tagbar widget start
        let htmlContent = '';
        json.tagdata.forEach(item => {
          htmlContent += `<li class="nav-item d-md-flex">` + `<input class="${item}" type="checkbox" name="${item}" value="${item}"/>` +
            `<a href="#" class="nav-link" data-val="${item}" data-type="val"">${item}</a>` +
            `</li>`;
        });

        $('ul.tagbar').html(htmlContent);
        //tagbar widget end
      }
    })
  });
  // database add tag click end
  // database link click start
  $(document).on('click', '.databaseLink', function () {
    let sel_node_id = $(this).parents('.drawflow-node').attr('id').split('-')[1];
    let n_data = editor.getNodeFromId(sel_node_id).data;
    let name = n_data.name;

    $.ajax({
      url: '/get_columns/' + name,
      success: function (json) {
        if (json.result != true) return true;
        var columns = JSON.parse(json.columns);
        var date_data = json.date_obj;
        var select_col_count = json.object_count;
        var int_col_count = json.int_count;
        var col_datas = [];
        var col_count = [];

        var table_htmlContent = '';
        var csrftoken = jQuery("[name=csrfmiddlewaretoken]").val();

        table_htmlContent += `<table id="databaseTable" class="table" style="width: 100%;"></table>`;

        col_datas = json.colData;
        for (var i = 0; i < columns.length; i++) {
          col_count.push(i);
        }

        $('#dataTable').empty();
        $('#dataTable').append(table_htmlContent);
        table = $("#databaseTable").DataTable({
          initComplete: function () {
            var filter_cont = $('<tr class="d-flex mb-2 col_filter"></tr>').insertAfter($("thead"))
            this.api().columns(col_count).every(function () {
              var td_columns = this;
              var col_no = td_columns[0][0];
              var column = col_datas[this[0]];
              var td = $('<td></td>').appendTo(filter_cont);
              var element = '';
              var min_val = '';
              var max_val = '';

              column = column.sort();

              if ($.inArray(col_no, date_data) != -1) {
                element = $('<input type="text" placeholder="Select date..." name="datefilter" value="" />');
              }
              else if ($.inArray(col_no, int_col_count) != -1) {
                element = $('<input type="text" class="dt_col_filter ' + col_no +'_select_min numrange form-input form-input-sm" placeholder="Min"></input>' +
                '<input type="text" class="dt_col_filter ' + col_no +'_select_max numrange form-input form-input-sm" placeholder="Max"></input>');
              }
              else{
                element = $('<select class="dt_col_filter form-select form-select-sm"><option value=""></option></select>');
              }

              if ($.inArray(col_no, date_data) != -1){
                element.appendTo(td);

                $(document).on("click", ".applyBtn", function () {
                  var val = $.fn.dataTable.util.escapeRegex(
                    $('input[name="datefilter"]').val()
                  );

                  td_columns
                    .search(val ? val : '', true, false)
                    .draw()
                });

                $(document).on("click", ".cancelBtn", function () {
                  var val = '';

                  td_columns
                    .search(val ? val : '', true, false)
                    .draw()
                });
              }
              else if ($.inArray(col_no, select_col_count) != -1){
                element
                .appendTo(td)
                .on('change', function () {
                  var val = $.fn.dataTable.util.escapeRegex(
                    $(this).val()
                  );

                  td_columns
                    .search(val ? val : '', true, false)
                    .draw()
                });
              }
              else if ($.inArray(col_no, int_col_count) != -1){
                element
                .appendTo(td)
                .on('change', function () {
                  var min_name = "."+ col_no +"_select_min";
                  var max_name = "."+ col_no +"_select_max";
                  min_val = $.fn.dataTable.util.escapeRegex(
                    $(min_name).val()
                  );
                  max_val = $.fn.dataTable.util.escapeRegex(
                    $(max_name).val()
                  );
                  console.log($(min_name).val());
                  console.log($(max_name).val());

                  if ($(min_name).val() == ''){
                    min_val = Math.min.apply(Math, column);
                  }
                  if ($(max_name).val() == ''){
                    max_val = Math.max.apply(Math, column);
                  }

                  console.log(min_val);
                  console.log(max_val);
                  var val = min_val + ' - ' + max_val;

                  console.log(val);

                  td_columns
                    .search(val ? val : '', true, false)
                    .draw()
                });
              }
              if ($.inArray(col_no, int_col_count) == -1){
                for (var i = 0; i < column.length; i++) {
                  if (column[i] != '') {
                    element.append('<option value="' + column[i] + '">' + column[i] + '</option>')
                  }
                }                
              }
            });

            //daterange picker
            $('input[name="datefilter"]').daterangepicker({
              autoUpdateInput: false,
              locale: {
                cancelLabel: 'Clear',
                timepicker: true
              }
            });

            $('input[name="datefilter"]').on('apply.daterangepicker', function (ev, picker) {
              $(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
            });

            $('input[name="datefilter"]').on('cancel.daterangepicker', function (ev, picker) {
              $(this).val('');
            });
          },
          initEdit: true,
          serverSide: true,
          processing: true,
          searching: true,
          pageLength: 25,
          dom: 'B<"clear">lfrtip',
          buttons: [
            {
              extend: 'collection',
              text: 'Column visibility',
              buttons: ['columnsToggle']
            },
            {
              text: 'Save changes',
              init: function () {
                this.disable();
              },
              action: function () {
                $.ajax({
                  url: "/db_update/",
                  method: "POST",
                  headers: {
                    'X-CSRFToken': csrftoken
                  },
                  data: { 'name': name, 'json': JSON.stringify(changedRows) },
                  success: function () {
                    $("td.orange").removeClass('orange');
                  }
                }),
                  changedRows.length = 0;

                this.disable();
              }
            },
          ],
          ajax: {
            "url": '/db_link/' + name + '/',
            "type": "POST",
            "contentType": "application/json",
            headers: {
              'X-CSRFToken': csrftoken
            },
            "data": function (d) {
              return JSON.stringify(d);
            }
          },
          columns: columns,
        })
          .on('xhr.dt', function (e, settings, json, xhr) {
            //modal header change start
            const newTitle = $('<h4 class="text-center text-format modal-title">' + json.file_name + '</h4><div class="modal-header-button">\n' +
              '<button type="button" class="full-screen"><i class="bi bi-fullscreen"></i></button>\n' +
              '</div><button type="button" class="close modalclose" data-dismiss="modal">&times;</button>');
            $(".db-title").text("");
            newTitle.appendTo($(".db-title"));
            //modal header change end

            $("#databaseTable").removeClass("editing");
          })
      },
      error: function (err) {
        console.log(err);
      }
    })
  });


  $("#sendTagBtn").on("click", function () {
    let title = '';
    title = $(".tagName").val();
    console.log(title);
    if (title == '') {
      $.alert({ title: 'Error', content: 'Please input Tagbar name.' });
    }
    else if (title != '') {
      $(".tagName").val('');
      var chkd = $('input:checkbox:checked');
      var vals = [];
      if (chkd.length >= 1) {
        vals = chkd.map(function () {
          return this.value;
        })
          .get();
      }
      console.log(vals)
      if (vals == '') {
        $.alert({ title: 'Error', content: 'Please select tag values.' });
      }
      else {
        sendTag(title, vals);
      }
    }
  });
  // database link click end

  // tag bar remove start
  $(document).on('mousedown', '.filterTab', function () {

  });
  // tag bar remove end
  // document ready end
});

var tagData = [];

function sendTag(title, tagContent) {
  let htmlContent = '';
  tagContent.forEach(item => {
    htmlContent += `<li class="nav-item btn btn-sm">` +
      `<a href="#" class="nav-link btn-val-shortcut" data-val="${item}" data-type="val" draggable="true" ondragstart="drag(event)">${item}</a>` +
      `</li>`
  });
  starthtmlContent = `<div class="tab-pane" id="` + title + `" role="tabpanel" aria-labelledby="` + title + `-tab">
  <ul class="nav flex-column">`;
  endhtmlContent = `</ul></div>`;
  finalhtmlContent = starthtmlContent + htmlContent + endhtmlContent;
  $(".customsidebar").append(finalhtmlContent);

  sendName = title;
  tagData[sendName] = tagContent;

  let csrf = $("meta[name=X-CSRFToken]").attr("content");

  $.ajax({
    method: 'post',
    url: "/tag_data/",
    data: { 'name': sendName, 'title': JSON.stringify(tagContent), 'csrfmiddlewaretoken': csrf },
    success: function (response) {
      let tabhtmlContent = '';
      title = response.name;

      tabhtmlContent = `<li class="` + title + `"><button class="nav-link filterTab" id="` + title + `-tab" data-bs-toggle="tab"
                                data-bs-target="#` + title + `"type="button" role="tab" 
                                aria-controls="` + title + `" aria-selected="false">` + title +
        `</button></li>`;
      $("#myTab").append(tabhtmlContent);
      update_tagconent_height()
    },
    error: function (err) {
      console.error(err);
    }
  });
}

function update_tagconent_height() {
  var mainheight = $('.mycl').height();
  var tabheight = $('#myTab').height();
  var tabcontentheight = mainheight - tabheight - 90;
  $('#myTabContent').css('height', tabcontentheight);
}

function sendData() {
  $("#command-form").submit();
}

function draw_graph(x_axis, y_axis, groupby = null, aggregate = null) {
  $.ajax({
    dataType: 'json',
    url: "/graph_json/",
    data: {
      'x': x_axis,
      'y': y_axis,
    },
    success: function (resp) {
      if (resp.result) {
        _draw_from_json(resp);
        _draw_axis(resp, x_axis, y_axis);
      } else {
        console.log('No data returned');
      }
    },
    error: function (request, status, error) {
      $.alert({ title: 'Error', content: error });
    }
  });
}

function draw_3d_graph(x_axis, y_axis, z_axis, groupby = null, aggregate = null){
  $.ajax({
    dataType: 'json',
    url: "/graph_3d_json/",
    data: {
      'x': x_axis,
      'y': y_axis,
      'z': z_axis,
    },
    success: function (resp){
      if (resp.result) {
        _draw_from_3d_json(resp);
        _draw_axis(resp, x_axis, y_axis, z_axis);
      } else {
        console.log('No data returned');
      }
    },
    error: function (request, status, error) {
      $.alert({ title: 'Error', content: error});
    }
  });
}

function run_command(command) {
  $("#command_input").val($("#command_input").val() + '\n' + command);
  $("#command-form").submit();
}


function _draw_from_json(data) {
  const config = global_large_layout;
  config.xaxis.title = {
    text: data.x_label,
    standoff: 30
  };
  config.yaxis.title = {
    text: data.y_label,
  };

  Plotly.newPlot("modal-graph", {
    "data": [data.trace],
    "layout": config,
    "config": {
      displaylogo: false,
      showLink: false,
      responsive: true
    }
  });
}

function _draw_axis(data, x_axis, y_axis, z_axis = "Date"){
  flag = data.flag;
  variables = data.variables;

  if (flag) {
    htmlContent = '';
    $('#graph-control').empty();
    htmlContent = `<form class="form" id="graph-2d-form">` +
      `<div class="form-group"><label>Axis X:</label>` +
      `<select id="scatter-x-2d" class="form-control select-variable" name="x-2d-data"></select>` +
      `<div id="scatter-x-2d-div"></div></div>` +
      `<div class="form-group"><label>Axis Y:</label>` +
      `<select id="scatter-y-2d" class="form-control select-variable" name="y-2d-data"></select>` +
      `<div id="scatter-y-2d-div"></div></div>` +
      `<button class="btn btn-customize draw-2d-graph">Draw Graph</button></form>`;
    $("#graph-control").append(htmlContent);
  }
  else{
    htmlContent = '';
    $('#graph-control').empty();
    htmlContent = `<form class="form" id="graph-3d-form">` +
      `<div class="form-group"><label>Axis X:</label>` +
      `<select id="scatter-x-3d" class="form-control select-variable" name="x-3d-data"></select>` +
      `<div id="scatter-x-3d-div"></div></div>` +
      `<div class="form-group"><label>Axis Y:</label>` +
      `<select id="scatter-y-3d" class="form-control select-variable" name="y-3d-data"></select>` +
      `<div id="scatter-y-3d-div"></div></div>` +
      `<div class="form-group"><label>Axis Z:</label>` +
      `<select id="scatter-z-3d" class="form-control select-variable" name="z-3d-data"></select>` +
      `<div id="scatter-z-3d-div"></div></div>` +
      `<button class="btn btn-customize draw-3d-graph">Draw Graph</button></form>`;
    $("#graph-control").append(htmlContent);
  }

  for (var i = 0; i < variables.length; i++) {
     $(".select-variable").append('<option value="' + variables[i] + '" data-type="'+ variables[i] +'">' + variables[i] + '</option>')
  }

  if (flag){
    $("#scatter-x-2d").val(x_axis).change();
    $("#scatter-y-2d").val(y_axis).change();
  }
  else{
    $("#scatter-x-3d").val(x_axis).change();
    $("#scatter-y-3d").val(y_axis).change();
    $("#scatter-z-3d").val(z_axis).change();
  }
}

function _draw_from_3d_json(data){
  const config = global_3d_layout;
  config.scene.xaxis.title = {
    text: data.x_label,
    standoff: 30
  };
  config.scene.yaxis.title = {
    text: data.y_label,
    standoff: 30
  };
  config.scene.zaxis.title = {
    text: data.z_label,
    standoff: 30
  };

  Plotly.newPlot("modal-graph", {
    "data": [data.trace],
    "layout": config,
    "config": {
      displaylogo: false,
      showLink: false,
      responsive: true,
    }
  });
}

async function uploadFile() {
  let formData = new FormData();
  let csrf = $("meta[name=X-CSRFToken]").attr("content");
  formData.append("file", fileupload.files[0]);
  formData.append("csrfmiddlewaretoken", csrf);
  const $loading = $('#loadingDiv');
  $loading.show();
  await fetch('/db_upload/', {
    method: "POST",
    body: formData,
  }).then((response) => {
    if (response.ok) {
      $loading.hide();
      return response.json();
    } else {
      throw new Error('Something went wrong');
      $loading.hide();
    }
  }).then((responseJson) => {
    if (responseJson.result) {
      // $(".db-file-name").text(responseJson.file_name);
      const newli = $('<li data-val="' + responseJson.file_name + '" data-type="data" draggable="true" ondragstart="drag(event)">'
        + responseJson.file_name + '<a href="javascript:;" class="btn remove" data-id="' + responseJson.id +
        '"><i class="glyphicon glyphicon-trash"></i></a></li>');
      newli.appendTo($(".db-list-group"));
    } else {
      throw new Error('Response went wrong');
    }
  })
    .catch((error) => {
      $.alert({ title: 'Error', content: error });
      $loading.hide();
    });
}

var elem = document.documentElement;
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}