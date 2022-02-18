$(function(){
  $(document).on('change',"#scatter-x-2d", function(){
    var col_name = $("#scatter-x-2d option:selected").text();
    var id = $(this).attr("id");
    $.ajax({
      url: "/get_variable_ranges/" + col_name,
      success: function (resp) {
        type = resp.dtype;
        _draw_variable_range(type, id, resp.data, 'x');
      },
      error: function (request, status, error) {
        $.alert({ title: 'Error', content: error });
      }
    });
  });

  $(document).on('change',"#scatter-y-2d", function(){
    var col_name = $("#scatter-y-2d option:selected").text();
    var id = $(this).attr("id");
    $.ajax({
      url: "/get_variable_ranges/" + col_name,
      success: function (resp) {
        type = resp.dtype;
        _draw_variable_range(type, id, resp.data, 'y');
      },
      error: function (request, status, error) {
        $.alert({ title: 'Error', content: error });
      }
    });
  });
  $(document).on('change',"#scatter-x-3d", function(){
    var col_name = $("#scatter-x-3d option:selected").text();
    var id = $(this).attr("id");
    $.ajax({
      url: "/get_variable_ranges/" + col_name,
      success: function (resp) {
        type = resp.dtype;
        _draw_variable_range(type, id, resp.data, 'x');
      },
      error: function (request, status, error) {
        $.alert({ title: 'Error', content: error });
      }
    });
  });

  $(document).on('change',"#scatter-y-3d", function(){
    var col_name = $("#scatter-y-3d option:selected").text();
    var id = $(this).attr("id");
    $.ajax({
      url: "/get_variable_ranges/" + col_name,
      success: function (resp) {
        type = resp.dtype;
        data = resp.data;
        _draw_variable_range(type, id, data, 'y');
      },
      error: function (request, status, error) {
        $.alert({ title: 'Error', content: error });
      }
    });
  });

  $(document).on('change',"#scatter-z-3d", function(){
    var col_name = $("#scatter-z-3d option:selected").text();
    var id = $(this).attr("id");
    $.ajax({
      url: "/get_variable_ranges/" + col_name,
      success: function (resp) {
        type = resp.dtype;
        _draw_variable_range(type, id, resp.data, 'z');
      },
      error: function (request, status, error) {
        $.alert({ title: 'Error', content: error });
      }
    });
  });

  // $(document).on('click',".draw-2d-graph", function(){
  //   select_2d_variable();
  // });
  // $(document).on('click', ".draw-3d-graph",  function(){
  //   select_3d_variable();
  // });

  //graph 2d variable section form submit
  $(document).on('submit',"#graph-2d-form", function () {
    let csrf = $("meta[name=X-CSRFToken]").attr("content");
    let formData = $(this).serialize();
    $.ajax({
      method: 'post',
      url: "/draw_2d_graph/",
      data: formData,
      headers: {
        'X-CSRFToken': csrf
      },
      success: function (resp) {
        _draw_from_json(resp);
      },
      error: function (request, status, error) {
        $.alert({title: 'Error', 'content': error});
      }
    });
    return false;
  });

  $(document).on('submit',"#graph-3d-form", function () {
    let csrf = $("meta[name=X-CSRFToken]").attr("content");
    let formData = $(this).serialize();
    $.ajax({
      dataType: 'json',
      method: 'post',
      url: "/draw_3d_graph/",
      data: formData,
      headers: {
        'X-CSRFToken': csrf
      },
      success: function (resp) {
        _draw_from_3d_json(resp);
      },
      error: function (request, status, error) {
        $.alert({title: 'Error', 'content': error});
      }
    });
    return false;
  });

  function select_2d_variable(){
    const x_selected = $("#scatter-x-2d").val();
    const y_selected = $("#scatter-y-2d").val();
    draw_graph(x_selected, y_selected);
  }
  function select_3d_variable(){
    const x_selected = $("#scatter-x-3d").val();
    const y_selected = $("#scatter-y-3d").val();
    const z_selected = $("#scatter-z-3d").val();
    draw_3d_graph(x_selected, y_selected, z_selected);
  }

  function _draw_variable_range(type, id, data, axis){
    var htmlContent = '';
    var id = "#" + id + "-div";
    if (type == 'object') {
      htmlContent = $('<select class="form-select form-control" name="' + axis + '"><option value=""></option></select>');
    }
    else if (type == 'date_filter'){
      htmlContent = $('<input type="text" placeholder="Select date..." name="' + axis + '" class="form-input" value="" />');
    }
    else{
      htmlContent =  $('<input type="text" class="select_min numrange form-input form-input-sm" placeholder="Min" name="' + axis + '_min"></input>' +
                '<input type="text" class="select_max numrange form-input form-input-sm" placeholder="Max" name="' + axis + '_max"></input>');
    }
    $(id).empty();
    htmlContent.appendTo($(id));

    $('input[name="datefilter"]').daterangepicker({
      autoUpdateInput: false,
      locale: {
        cancelLabel: 'Clear',
        timepicker: true
      }
    });

    if (type == 'object'){
      for (var i = 0; i < data.length; i++) {
        if (data[i] != '') {
          htmlContent.append('<option value="' + data[i] + '">' + data[i] + '</option>')
        }
      }
    }
  }
});