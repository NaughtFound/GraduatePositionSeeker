const alertBox = Swal.mixin({
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
  const res = await http.get("members");

  const member_list = await res.json();

  const parent = document.getElementById("faculties");
  const tbody = parent.getElementsByTagName("tbody")[0];

  const rows = [];

  if (member_list.length == 0) {
    tbody.innerHTML = `
    <tr>
      <th colspan="6">
        <h5 align="center" class="m-2">No Data Found</h5>
      </th>
    </tr>
    `;
    return;
  }

  for (const member of member_list) {
    const member_id = member[0];

    rows.push(`
    <tr id="${member_id}">
      <th scope="row" class="col-md-1">${rows.length + 1}</th>
      <td class="col-md">${member[1]["name"]}</td>
      <td class="col-md">${member[1]["university"]}</td>
      <td class="col-md">${member[1]["interest"]}</td>
      <td class="col-md"><a class="btn-sm btn-info" href="${
        member[1]["link"]
      }" target="_blank">Link</a></td>
      <td class="col-md-2">
        <div class="btn-group btn-group-sm" role="group">
          <button
            type="button"
            class="btn btn-danger btn-upload"
            onclick="remove_member(this,'${member_id}')"
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
        </div>
      </td>
    </tr>`);
  }

  tbody.innerHTML = rows.join("");
};

const update_universities = async () => {
  const res = await http.get("univ");

  const univ_list = await res.json();

  const parent = document.getElementById("universities");
  const tbody = parent.getElementsByTagName("tbody")[0];

  const rows = [];

  if (univ_list.length == 0) {
    tbody.innerHTML = `
    <tr>
      <th colspan="3">
        <h5 align="center" class="m-2">No Data Found</h5>
      </th>
    </tr>
    `;
    return;
  }

  for (const univ of univ_list) {
    const univ_id = univ[0];

    rows.push(`
    <tr id="${univ_id}">
      <th scope="row" class="col-md-1">${rows.length + 1}</th>
      <td class="col-md">${univ[1]["name"]}</td>
      <td class="col-md-1">
        <div class="btn-group btn-group-sm" role="group">
          <button
            type="button"
            class="btn btn-danger btn-upload"
            onclick="remove_university(this,'${univ_id}')"
          >
            Remove
          </button>
        </div>
      </td>
    </tr>`);
  }

  tbody.innerHTML = rows.join("");
};

const add_university = button_manager(async (resolve) => {
  return alertBox
    .fire({
      title: "Add New University",
      html: `
    <form id="swal-form">
      <input name="name" class="form-control mb-3" placeholder="Name" required>
      </select>
    </form>
  `,
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
    options.push(`<option value="${id}">${data.name}</option>`);
  }

  return alertBox
    .fire({
      title: "Add New Faculty",
      html: `
    <form id="swal-form">
      <input name="name" class="form-control mb-3" placeholder="Name" required>
      <select name="university" class="form-select mb-3" required>
          ${options.join("")}
      </select>
      <input name="interest" class="form-control mb-3" placeholder="Interests" required>
      <input name="link" class="form-control mb-3" placeholder="Link" required>
    </form>
  `,
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

const remove_member = button_manager(async (resolve, member_id) => {
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

window.addEventListener("load", () => {
  update_faculties();
  update_universities();
});
