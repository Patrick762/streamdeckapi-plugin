document.addEventListener(
  "init",
  async ({ settings, pluginSettings, action }) => {
    // show the actions settings block
    const actionPI = document.getElementById(action);

    if (actionPI) {
      actionPI.className = "";
    }

    // destroy other actions
    Array.from(document.querySelectorAll(".isAction.hidden")).forEach((e) =>
      e.parentNode.removeChild(e)
    );
  }
);

document.addEventListener(
  "stateChange",
  async ({ changed, settings, pluginSettings, action }) => {
    // do something
  }
);
