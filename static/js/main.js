const alertBox = Swal.mixin({
  theme: "dark",
  customClass: {
    confirmButton: "btn btn-success",
    cancelButton: "btn btn-danger",
  },
  preConfirm: () => {
    const form = document.getElementById("swal-form");
    if (form == undefined) return undefined;

    if (!form.checkValidity()) {
      Swal.showValidationMessage("Please fill in all fields correctly!");
      return false;
    }

    const formData = new FormData(form);

    return Object.fromEntries(formData);
  },
});

const http = {
  post: (url, data) =>
    fetch(`http://127.0.0.1:5000/${url}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
      mode: "cors",
    }),
  delete: (url, data) =>
    fetch(`http://127.0.0.1:5000/${url}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "DELETE",
      body: JSON.stringify(data),
      mode: "cors",
    }),
  get: (url) =>
    fetch(`http://127.0.0.1:5000/${url}`, {
      method: "GET",
      mode: "cors",
    }),
};

const create_html_form = (id, fields) => {
  const rows = [];

  for (const field of fields) {
    const { type, name, placeholder } = field;

    switch (type) {
      case "email":
      case "text":
        rows.push(
          `<input 
            type="${type}"
            name="${name}"
            class="form-control mb-3"
            placeholder="${placeholder}"
            required
          >`
        );
        break;
      case "select":
        const options = [];
        for (const option of field.options) {
          options.push(`<option value="${option.id}">${option.name}</option>`);
        }
        rows.push(
          `<select name="${name}" class="form-select mb-3" required>
            <option value="" disabled selected>${placeholder}</option>
            ${options.join("")}
          </select>`
        );
        break;
      default:
        break;
    }
  }

  return `<form id="${id}">${rows.join("")}</form>`;
};

const button_manager = (fn) => {
  return async (me, ...args) => {
    const name = me.innerHTML;
    me.innerHTML = `<div class="spinner-border spinner-border-sm" role="status"></div>`;
    me.disabled = true;

    await new Promise(async (resolve) => {
      return await fn(resolve, ...args).catch(console.log);
    });

    me.innerHTML = name;
    me.disabled = false;
  };
};

const update_faculties = async () => {
  const table = window.faculties;

  table.clear();

  const res = await http.get("members");

  const member_list = await res.json();

  if (member_list.length == 0) {
    table.draw();
    return;
  }

  let i = 1;

  for (const member of member_list) {
    const member_id = member[0];

    table.rows.add([
      [
        i,
        member[1]["name"],
        member[1]["university"],
        member[1]["interests"],
        `<a class="btn-sm btn-info" href="${member[1]["link"]}" target="_blank">Link</a>`,
        `<div class="btn-group btn-group-sm" role="group">
          <button
            type="button"
            class="btn btn-danger btn-upload"
            onclick="remove_faculty(this,'${member_id}')"
          >
            Remove
          </button>
          <button
            type="button"
            class="btn btn-warning btn-email"
            onclick="send_email(this,'${member_id}')"
          >
            Send Email
          </button>
        </div>`,
      ],
    ]);

    i++;
  }

  table.draw();
};

const update_universities = async () => {
  const table = window.universities;

  table.clear();

  const res = await http.get("univ");

  const univ_list = await res.json();

  if (univ_list.length == 0) {
    table.draw();
    return;
  }

  let i = 1;

  for (const univ of univ_list) {
    const univ_id = univ[0];

    table.rows.add([
      [
        i,
        univ[1]["name"],
        `<div class="btn-group btn-group-sm" role="group">
          <button
            type="button"
            class="btn btn-danger btn-upload"
            onclick="remove_university(this,'${univ_id}')"
          >
            Remove
          </button>
        </div>`,
      ],
    ]);

    i++;
  }

  table.draw();
};

const update_positions = async () => {
  const table = window.positions;

  table.clear();

  const res = await http.get("pos");

  const pos_list = await res.json();

  if (pos_list.length == 0) {
    table.draw();
    return;
  }

  let i = 1;

  for (const pos of pos_list) {
    const pos_id = pos[0];

    table.rows.add([
      [
        i,
        pos[1]["title"],
        pos[1]["deadline"],
        `<a class="btn-sm btn-info" href="${pos[1]["link"]}" target="_blank">Link</a>`,
        `<div class="btn-group btn-group-sm" role="group">
          <button
            type="button"
            class="btn btn-danger btn-upload"
            onclick="remove_position(this,'${pos_id}')"
          >
            Remove
          </button>
        </div>`,
      ],
    ]);

    i++;
  }

  table.draw();
};

const add_position = button_manager(async (resolve) => {
  return alertBox
    .fire({
      title: "Add New Position",
      html: create_html_form("swal-form", [
        { type: "text", name: "title", placeholder: "Title" },
        { type: "text", name: "deadline", placeholder: "Main deadline" },
        { type: "text", name: "link", placeholder: "Link" },
      ]),
      focusConfirm: false,
      showCancelButton: true,
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        const data = result.value;
        await http.post("pos", data);
        update_positions();
      }
      resolve();
    });
});

const add_university = button_manager(async (resolve) => {
  return alertBox
    .fire({
      title: "Add New University",
      html: create_html_form("swal-form", [
        { type: "text", name: "name", placeholder: "Name of the university" },
      ]),
      focusConfirm: false,
      showCancelButton: true,
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        const data = result.value;
        await http.post("univ", data);
        update_universities();
      }
      resolve();
    });
});

const add_faculty = button_manager(async (resolve) => {
  const res = await http.get("univ");
  const univ_list = await res.json();

  const options = [];

  for (const univ of univ_list) {
    const id = univ[0];
    const data = univ[1];
    options.push({ id, name: data.name });
  }

  return alertBox
    .fire({
      title: "Add New Faculty",
      html: create_html_form("swal-form", [
        {
          type: "text",
          name: "name",
          placeholder: "Name of the faculty member",
        },
        {
          type: "select",
          name: "university",
          placeholder: "Select University",
          options,
        },
        {
          type: "email",
          name: "email",
          placeholder: "Email of the faculty member",
        },
        {
          type: "text",
          name: "interests",
          placeholder: "Interests",
        },
        {
          type: "text",
          name: "link",
          placeholder: "Link",
        },
      ]),
      focusConfirm: false,
      showCancelButton: true,
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        const data = result.value;
        await http.post("members", data);
        update_faculties();
      }
      resolve();
    });
});

const remove_faculty = button_manager(async (resolve, member_id) => {
  return alertBox
    .fire({
      title: "Do you want to delete this member?",
      showCancelButton: true,
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        await http.delete("members", {
          member_id,
        });
        update_faculties();
      }
      resolve();
    });
});

const remove_university = button_manager(async (resolve, univ_id) => {
  return alertBox
    .fire({
      title: "Do you want to delete this university?",
      showCancelButton: true,
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        await http.delete("univ", {
          univ_id,
        });
        update_universities();
        update_faculties();
      }
      resolve();
    });
});

const remove_position = button_manager(async (resolve, pos_id) => {
  return alertBox
    .fire({
      title: "Do you want to delete this position?",
      showCancelButton: true,
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        await http.delete("pos", {
          pos_id,
        });
        update_positions();
      }
      resolve();
    });
});

window.addEventListener("load", () => {
  window.faculties = new DataTable("#faculties", {
    columnDefs: [
      {
        targets: [1, 2, 3, 4, 5],
        type: "string",
      },
      {
        orderable: false,
        targets: [-1, -2],
      },
    ],
  });
  window.universities = new DataTable("#universities", {
    columnDefs: [
      {
        targets: [1, 2],
        type: "string",
      },
      {
        orderable: false,
        targets: [-1],
      },
    ],
  });
  window.positions = new DataTable("#positions", {
    columnDefs: [
      {
        targets: [1, 3, 4],
        type: "string",
      },
      {
        targets: 2,
        render: function (data) {
          return moment(data).format("YYYY MMM DD");
        },
      },
      {
        orderable: false,
        targets: [-1, -2],
      },
    ],
  });
  update_faculties();
  update_universities();
  update_positions();
});
