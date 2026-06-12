//Leonardo Stuani Godoi
const showSnackbar = (message, severity = "info") => {
  window.dispatchEvent(
    new CustomEvent("showSnackbar", {
      detail: { message, severity },
    }),
  );
};

export default showSnackbar;