const id = document.getElementById("drawflow");
const editor = new Drawflow(id);
const TYPE_DATA = 'data';
const TYPE_COMMAND = 'command';
const TYPE_VAL = 'val';
const TYPE_GRAPH = 'graph';
const TYPE_DATE = 'date';


editor.start();
editor.reroute = true;

const init_net = function() {
  if(mainnet) {
   editor.import(mainnet);
  } else {
    const db_node = 'Database';
    editor.addNode(db_node, 0, 1, 100, 180, db_node, {
      'name': db_node,
      'type': TYPE_DATA
    }, "<div><div class='title-box'><i class='fa fa-database'></i> Database</div>" +
      "<div class='box'><div class='db-file-name'><a class='btn databaseLink' data-toggle='modal' data-target='#databaseModal'>" + db_name + "</a>"
      + "<i class='bi bi-tag btn databaseTagAdd'  data-toggle='modal' data-target='#addtagModal'></i></div>");
  }
}

init_net();
// editor.import(dataToImport);
// editor.addModule('Other');

// Events!
editor.on('nodeCreated', function (id) {
  console.log("Node created " + id);
})

editor.on('nodeRemoved', function (id) {
  console.log("Node removed " + id);
})

editor.on('nodeSelected', function (id) {
  const node = editor.getNodeFromId(id);
  if (node.data.type == TYPE_GRAPH) {
    // modal show
    // $('#graphModal').modal('show');
    // draw_graph('Date', graph_data.Date, 'SP', graph_data.SP);
  }

});

editor.on('moduleCreated', function (name) {
  console.log("Module Created " + name);
});

editor.on('moduleChanged', function (name) {
  console.log("Module Changed " + name);
});

editor.on('connectionStart', function (output) {
  console.log(output);
});

editor.on('connectionCreated', function (connection) {
  console.log('Connection created');
  console.log(connection);
});

editor.on('connectionRemoved', function (connection) {
  console.log('Connection removed');
  console.log(connection);
});

editor.on('mouseMove', function (position) {
  // console.log('Position mouse x:' + position.x + ' y:'+ position.y);
});

editor.on('nodeMoved', function (id) {
  console.log("Node moved " + id);
});

editor.on('zoom', function (zoom) {
  console.log('Zoom level ' + zoom);
});

editor.on('translate', function (position) {
  console.log('Translate x:' + position.x + ' y:' + position.y);
});

editor.on('addReroute', function (id) {
  console.log("Reroute added " + id);
});

editor.on('removeReroute', function (id) {
  console.log("Reroute removed " + id);
});


/* DRAG EVENT */

/* Mouse and Touch Actions */

var elements = document.getElementsByClassName('drag-drawflow');
for (var i = 0; i < elements.length; i++) {
  elements[i].addEventListener('touchend', drop, false);
  elements[i].addEventListener('touchmove', positionMobile, false);
  elements[i].addEventListener('touchstart', drag, false);
}

var mobile_item_selec = '';
var mobile_last_move = null;

function positionMobile(ev) {
  mobile_last_move = ev;
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  console.log(ev);
  if (ev.type === "touchstart") {
    mobile_item_selec = ev.target.closest(".drag-drawflow").getAttribute('data-val');
  } else {
    const type = ev.target.getAttribute('data-type');

    ev.dataTransfer.setData("type", ev.target.getAttribute('data-type'));
    if(type == 'date') {
      ev.dataTransfer.setData("node", $("#date_from").val() + "," + $("#date_to").val());
    } else {
      ev.dataTransfer.setData("node", ev.target.getAttribute('data-val'));
    }
  }
}

function drop(ev) {
  if (ev.type === "touchend") {
    var parentdrawflow = document.elementFromPoint(mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY).closest("#drawflow");
    if (parentdrawflow != null) {
      addNodeToDrawFlow(mobile_item_selec, mobile_last_move.touches[0].clientX, mobile_last_move.touches[0].clientY);
    }
    mobile_item_selec = '';
  } else {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("node");
    var type = ev.dataTransfer.getData("type");
    addNodeToDrawFlow(data, type, ev.clientX, ev.clientY);
  }

}

function addNodeToDrawFlow(name, type, pos_x, pos_y) {
  if (editor.editor_mode === 'fixed') {
    return false;
  }
  pos_x = pos_x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)) - (editor.precanvas.getBoundingClientRect().x * (editor.precanvas.clientWidth / (editor.precanvas.clientWidth * editor.zoom)));
  pos_y = pos_y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)) - (editor.precanvas.getBoundingClientRect().y * (editor.precanvas.clientHeight / (editor.precanvas.clientHeight * editor.zoom)));

  var dom_obj = '';
  switch (type) {
    case TYPE_VAL:
      dom_obj = `
      <div>
        <div class="title-box"><i class="fa fa-star"></i> ` + name + `</div>
      </div>`;
      break;
    case TYPE_COMMAND:
      dom_obj = `
      <div>
        <div class="title-box">
            <i class="bi bi-command"></i> ` + name + `
        </div>
        <div class="box"><a class="btn btn-run-command">Run</a></div>
      </div>`;
      break;
    case TYPE_GRAPH:
      dom_obj = `
      <div>
        <div class="title-box">
            <i class="bi bi-bar-chart-fill"></i> ` + name + `
        </div>
        <div class="box"><a class="btn btn-run">Run</a></div>
      </div>`;
      break;
    case TYPE_DATE:
      dom_obj = `
      <div>
        <div class="title-box">
            <i class="bi bi-clock"></i> ` + name + `
        </div>
      </div>`;
      break;
    case TYPE_DATA:
      dom_obj = `
      <div>
        <div class="title-box">
            <i class="fa fa-database"></i> Database
        </div>
        <div class="box"><div class="db-file-name"><a class="btn databaseLink" data-toggle="modal" data-target="#databaseModal">` + name + `</a> 
        <i class="bi bi-tag btn databaseTagAdd" data-toggle="modal" data-target="#addtagModal"></i></div>`;
      break;
    default:
      dom_obj = `
      <div>
        <div class="title-box">` + name + `</div>
      </div>`;
  }

  editor.addNode(name, 1, 1, pos_x, pos_y, name, {'name': name, 'type': type}, dom_obj);
}

var transform = '';

function showpopup(e) {
  e.target.closest(".drawflow-node").style.zIndex = "9999";
  e.target.children[0].style.display = "block";
  //document.getElementById("modalfix").style.display = "block";

  //e.target.children[0].style.transform = 'translate('+translate.x+'px, '+translate.y+'px)';
  transform = editor.precanvas.style.transform;
  editor.precanvas.style.transform = '';
  editor.precanvas.style.left = editor.canvas_x + 'px';
  editor.precanvas.style.top = editor.canvas_y + 'px';
  console.log(transform);

  //e.target.children[0].style.top  =  -editor.canvas_y - editor.container.offsetTop +'px';
  //e.target.children[0].style.left  =  -editor.canvas_x  - editor.container.offsetLeft +'px';
  editor.editor_mode = "fixed";

}

function closemodal(e) {
  e.target.closest(".drawflow-node").style.zIndex = "2";
  e.target.parentElement.parentElement.style.display = "none";
  //document.getElementById("modalfix").style.display = "none";
  editor.precanvas.style.transform = transform;
  editor.precanvas.style.left = '0px';
  editor.precanvas.style.top = '0px';
  editor.editor_mode = "edit";
}

function changeModule(event) {
  var all = document.querySelectorAll(".menu ul li");
  for (var i = 0; i < all.length; i++) {
    all[i].classList.remove('selected');
  }
  event.target.classList.add('selected');
}

function changeMode(option) {

//console.log(lock.id);
  if (option == 'lock') {
    lock.style.display = 'none';
    unlock.style.display = 'block';
  } else {
    lock.style.display = 'block';
    unlock.style.display = 'none';
  }

}