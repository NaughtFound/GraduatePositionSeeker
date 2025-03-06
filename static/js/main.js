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
        member[1]["interest"],
        `<a class="btn-sm btn-info" href="${member[1]["link"]}" target="_blank">Link</a>`,
        `<div class="btn-group btn-group-sm" role="group">
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
      </button>`,
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
  window.faculties = new DataTable("#faculties", {
    columnDefs: [
      {
        targets: "_all",
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
        targets: "_all",
        type: "string",
      },
      {
        orderable: false,
        targets: [-1],
      },
    ],
  });
  update_faculties();
  update_universities();
});
