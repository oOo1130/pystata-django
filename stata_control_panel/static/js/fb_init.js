$(function () {
  let env = {};
  let select_filename = '';

  reload();
  
  $(document).on("click", ".file-item", function () {
    const fname = $(this).data("filename");
    getData('/fb_show_text/' + $(this).data("filename"))
      .then(data => {
        text_editor.setValue(data);
        select_filename = fname;
      });
  });

  $("#reload-files").click(function () {
    reload();
  });

  $("#btn-save").click(function(){
    postData('/fb_save/' + select_filename, {'content': text_editor.getValue()})
      .then(data => {
        if( data.result == "ok") {
          text_editor.setValue(data.output);
          $.alert({title: 'Success', content: 'File saved!'});
        }
        else {
          $.alert({title: 'Error', content: 'File saving error!'});
        }
      });
  });

  $("#btn-create").click(function(){
    let fname = $("#new-file").val();
    const ext = (/[.]/.exec(fname)) ? /[^.]+$/.exec(fname) : undefined;
    if(!ext || ext != "do")
      fname = fname + ".do";
    if( !fname ) {
      $.alert({title: 'Warning', content: 'Input a new filename!'});
      $("#new-file").focus();
      return false;
    }
    postData('/fb_create/' + fname, {'content': $("#file-text").val()})
      .then(data => {
        if( data.result == "ok") {
          text_editor.setValue('');
          $("#new-file").val('');
          select_filename = fname;
          reload();
        } else if ( data.result == "exist") {
          $.alert({title: 'Error', content: 'The file already exist!'});
        }
        else {
          $.alert({title: 'Error', content: 'File creating error!'});
        }
      });
  });

  $("#btn-delete").click(function(){
    if(!select_filename) {
      $.alert({title: 'Error', content: 'Please select a file!'});
      return false;
    }

    $.confirm({
        title: 'Warning!',
        content: 'Are you sure to delete!',
        buttons: {
            yes: function () {
              getData('/fb_delete/' + select_filename)
              .then(data => {
                data = JSON.parse(data);
                if( data.result == "ok") {
                  select_filename = '';
                  reload();
                }
                else {
                  $.alert({title: 'Error', content: 'File deleting error!'});
                }
              });

            },
            cancel: function () {
            },
        }
    });
  });

  $("#btn-run").click(function(){
    const do_content = text_editor.getValue();
    const csrf = $("meta[name=X-CSRFToken]").attr("content");

    if( do_content == "") return false;

    $.ajax({
      dataType: 'json',
      method: 'post',
      url: "/run_command/",
      data: {'command': do_content, 'csrfmiddlewaretoken': csrf},
      success: function (resp) {
        if (resp.result) {
          $("#stata-result").empty();
          $("#stata-result").text(resp.stata_result);
          $("#result-history").text($("#result-history").text() + "\n" + resp.stata_result);

          let new_item = $("<ul class='nav-item btn'><div class='row text-format'><div class='col-md-4'>" + resp.command.command + "</div><div class='col-md-4'>" + resp.command.time + "</div><div class='col-md-4'>" + resp.command.user + "</div></div></ul>")
           new_item.appendTo(".commandHistoryBar");
          $.alert({title: 'Run Do File', content: 'Successfully run do file. Please check the result.'});
        } else {
          $.alert({title: 'Error', content: 'No data returned!'});
        }
      },
      error: function (request, status, error) {
        $.alert({title: 'Error', content: error});
      }
    });
    return false;
  });



  function reload() {
    getData('/fb_browse')
      .then(data => {
        $("#file-list").html(data);
      });
  }

  async function getData(url = '') {
    const response = await fetch(url)
      .then(response => response.text())
    return response;
  };

  async function postData(url = '', data = {}) {
    const csrf = $("meta[name=X-CSRFToken]").attr("content");
    const response = await fetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        "X-CSRFToken": csrf
      },
      body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }
});
