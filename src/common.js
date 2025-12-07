function format_date(time_stamp, time_zone){
    if(time_zone === undefined){
        time_zone = get_local_timezone_int();
    }

    console.log("format_date time_stamp:", time_stamp, "time_zone:", time_zone)

    const localMillis = time_stamp / 1000 + time_zone * 3600 * 1000;
    const date = new Date(localMillis);

    const pad = (n) => n.toString().padStart(2, '0');

    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hour = pad(date.getUTCHours());
    const minute = pad(date.getUTCMinutes());
    const second = pad(date.getUTCSeconds());

    const tzSign = time_zone >= 0 ? '+' : '-';
    const tz = `UTC${tzSign}${Math.abs(time_zone).toString().padStart(2, '0')}`;

    return `${year}-${month}-${day} ${hour}:${minute}:${second}${tz}`;
}
function format_date_ms(time_stamp, time_zone) {
    if (!time_stamp){
        console.log(time_stamp)
        return `Unknown date`;
    }
    const date = new Date(time_stamp / 1000);
    return date.toLocaleString()
}

function wait_for_ms(time_ms){
    return new Promise(resolve => setTimeout(resolve, time_ms));
}
// await wait_for_ms(1000);

// function get_local_timezone_int(){
//     const timezoneOffsetMin = new Date().getTimezoneOffset();
//     const timezoneOffsetHour = Math.round(-timezoneOffsetMin / 60);
//     return timezoneOffsetHour
// }
// Helper function to get local timezone offset
function get_local_timezone_int() {
    return new Date().getTimezoneOffset() * -1; // Convert to positive for UTC offset
}

// function get_local_timezone_int() {
//     return -(new Date().getTimezoneOffset() / 60);
// }

// function upload_file(file, file_name, on_success=null){
//     const form_data = new FormData();
//     form_data.append("file_bytes", file);
//     form_data.append("file_name", file_name);
//     const xhr = new XMLHttpRequest();
//     xhr.open("POST", "/file/upload", true);
//     xhr.onreadystatechange = ()=> {
//         if (xhr.readyState === 4) {
//             console.log("upload_success")

//             if (xhr.status === 200) {
//                 // alert(xhr.responseText);

//                 try{
//                     var response_dict = JSON.parse(xhr.responseText); // parse JSON response
//                 }catch(err){
//                     alert(`NON_JSON_RESPONSE\n${xhr.responseText}`)
//                     return
//                 }
//                 if(on_success){
//                     on_success(response_dict)
//                 }         

//             } else {
//                 alert(`xhr.status:${xhr.status}. xhr.responseText:${xhr.responseText}`);
//                 // var response_dict = JSON.parse(xhr.responseText); // parse JSON response
//             }
//         }
//     };
//     xhr.setRequestHeader('X-CSRFToken', get_cookie('csrftoken'));
//     xhr.send(form_data);
// }


// helper function to get CSRF token from cookies
const get_cookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };


// function get_cookie(key) {
//     var cookieArr = document.cookie.split(';');
//     for (var i = 0; i < cookieArr.length; i++) {
//         var cookie = cookieArr[i].trim();
//         if (cookie.startsWith(key + '=')) {
//             return cookie.substring(key.length + 1);
//         }
//     }
//     return null; // return null if the cookie doesn't exist
// }

function get_table_rows(table){
    return table.querySelectorAll("tbody tr");
}

function clear_table(table_id){
    // get the table element
    const table = document.getElementById(table_id);  // replace 'myTable' with your table ID
    // get the tbody element
    const tbody_list = table.getElementsByTagName('tbody');
    if(tbody_list.length != 1) return;
    const tbody = tbody_list[0];
    while (tbody.rows.length > 0) { // clear all rows inside tbody
        tbody.deleteRow(0);
    }
}

function get_table_cell(table, row_index, col_index){
    try{
        const tbody = table.querySelector("tbody");  
        const cell = tbody.rows[row_index].cells[col_index]; 
        return cell
    }catch(error){
        console.log(error)
        return null;
    }
}

function get_table_row(table, row_index){
    try{
        const tbody = table.querySelector("tbody");  
        const cell = tbody.rows[row_index]
        return cell.textContent
    }catch(error){
        return null;
    }
}

function get_index_as_child(element){
    // get the parent element
    const parent = element.parentNode;
    // get all child elements of the parent
    const children = Array.from(parent.children); // Convert the HTMLCollection to an array
    // find the index of the element in the parent's children
    const index = children.indexOf(element);
    return index;
}

function copy_to_clipboard(content, on_success){
    try{
        navigator.clipboard.writeText(content) // 必须https下才能使用.
        .then(() => {
            console.log('Content copied to clipboard');
            if (on_success) {
                on_success();
            }
        })
        .catch((err) => {
            console.error('Failed to copy: ', err);
        });
    }catch(err){
        console.error('Failed to copy: ', err);
    }
}

function parse_int(value){
    return parseInt(value) || 0;
}
function random_float(a, b){
    return Math.random() * (b - a) + a;
}
function random_int(a, b) {
    return Math.floor(random_float(a, b))
}

function get_top_int(el){
    return parse_int(window.getComputedStyle(el).top);
}

// message_box相关功能
let message_box_list = document.getElementById("message-box-list");
let child_display_first_index;
let timer_message_box = null;
let message_box_count = 0;
let message_box_display_num = 0;

function create_message_box(message){
    // console.log("create_message_box()")
    let message_box = document.createElement("div");
    message_box.classList.add("message-box");
    message_box.id = `message-box-${message_box_count}`;
    message_box_count += 1;
    // message_box.textContent = message;
    message_box.innerHTML = message;
    
    let top_value;
    if(message_box_list.children.length === 0){
        message_box.style.top = "-2px";
        const top_offset = parse_int(window.getComputedStyle(message_box_list).top);
        top_value = `${+ 8}px`;
        child_display_first_index = 0;
    }else{
        const top_value_last = get_top_int(message_box_list.lastElementChild);
        const height_last = message_box_list.lastElementChild.offsetHeight;
        top_value = `${top_value_last + height_last + 8}px`;
        // console.log('child_top_value', top_value)
    }
    message_box.style.top = top_value;
    message_box_list.appendChild(message_box);
    if (typeof timer_message_box !== "undefined" && timer_message_box) {
        clearTimeout(timer_message_box);
        timer_message_box = null;
    }
    timer_message_box = setTimeout(()=>{
        update_message_box_pos();
    }, 3000)
}

function update_message_box_pos(){
    const messageListLength = message_box_list.children.length;
    if(messageListLength === 0) return;

    let container_top = get_top_int(message_box_list);
    const child_last = message_box_list.children[message_box_list.children.length - 1];
    let child_last_bottom = container_top + get_top_int(child_last) + child_last.offsetHeight;
    // console.log(container_top, parse_int(child_last.style.top), child_last.offsetHeight)
    console.log("child_last_bottom:", child_last_bottom);
    if(child_last_bottom > 0){                
        for(let i = message_box_list.children.length - 1; i >= 0; i --){
            const child = message_box_list.children[i];
            container_top = get_top_int(message_box_list);
            const child_top = get_top_int(child);
            const child_bottom = container_top + child_top + child.offsetHeight;
            let child_next_bottom = null;
            if(i > 0){
                const child_next = message_box_list.children[i - 1];
                const child_next_top = get_top_int(child_next);
                child_next_bottom = container_top + child_next_top + child_next.offsetHeight;
            }
            
            // console.log(`child ${i} bottom: ${child_bottom}`)
            // console.log(`child_next_bottom: ${child_next_bottom}`)
            if(child_bottom > 0 && (child_next_bottom < 0 || child_next_bottom === null)){
                const top_change = - child_bottom - 1;
                const top_new = container_top + top_change;
                // console.log(`message_box_list top_new: ${top_new}`)
                message_box_list.style.top = `${top_new}px`;
                break;
            }
        }
    }

    const timer = setTimeout(()=>{
        update_message_box_pos();
    }, 3000)
}

function show_message(message){
    console.log("show_message()")
    if(!message){
        message = `message ${message_box_count}`
        let line_num = random_int(0, 5)
        for(let i = 0; i < line_num; i++){
            message += `<br>line ${i}`;
        }
        console.log(message);
    }
    create_message_box(message)
}

// Add exports at the end of the file
export {
    format_date,
    format_date_ms,
    wait_for_ms,
    get_local_timezone_int,
    get_cookie,
    get_table_rows,
    clear_table,
    get_table_cell,
    get_table_row,
    get_index_as_child,
    copy_to_clipboard,
    parse_int,
    random_float,
    random_int,
    get_top_int,
    create_message_box,
    update_message_box_pos,
    show_message
}


