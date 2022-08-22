const args = (() => {
  const scriptTag = document.getElementById('__apr-donate-script');
  const query = scriptTag.src.replace(/^[^\?]+\??/, '');
  const vars = query.split('&');
  const args = {};
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    args[pair[0]] = decodeURI(pair[1]).replace(/\,/g, ' ');
  }
  return args;
})();

const baseUrl = 'https://apirone.com';

const donateWidget = document.getElementById('__apr-donate-widget');

const invoices = [];
let actualIntervalId;
const currencyNames = {};

const elementSizes = {
  coinWidth: 35.2,
  dropdownBtnWidth: 70.5,
  widgetWidth: 0,
};

const coinIcons = {
  btc: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI0Y3OTMxQSIvPjxwYXRoIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0ibm9uemVybyIgZD0iTTIzLjE4OSAxNC4wMmMuMzE0LTIuMDk2LTEuMjgzLTMuMjIzLTMuNDY1LTMuOTc1bC43MDgtMi44NC0xLjcyOC0uNDMtLjY5IDIuNzY1Yy0uNDU0LS4xMTQtLjkyLS4yMi0xLjM4NS0uMzI2bC42OTUtMi43ODNMMTUuNTk2IDZsLS43MDggMi44MzljLS4zNzYtLjA4Ni0uNzQ2LS4xNy0xLjEwNC0uMjZsLjAwMi0uMDA5LTIuMzg0LS41OTUtLjQ2IDEuODQ2czEuMjgzLjI5NCAxLjI1Ni4zMTJjLjcuMTc1LjgyNi42MzguODA1IDEuMDA2bC0uODA2IDMuMjM1Yy4wNDguMDEyLjExLjAzLjE4LjA1N2wtLjE4My0uMDQ1LTEuMTMgNC41MzJjLS4wODYuMjEyLS4zMDMuNTMxLS43OTMuNDEuMDE4LjAyNS0xLjI1Ni0uMzEzLTEuMjU2LS4zMTNsLS44NTggMS45NzggMi4yNS41NjFjLjQxOC4xMDUuODI4LjIxNSAxLjIzMS4zMThsLS43MTUgMi44NzIgMS43MjcuNDMuNzA4LTIuODRjLjQ3Mi4xMjcuOTMuMjQ1IDEuMzc4LjM1N2wtLjcwNiAyLjgyOCAxLjcyOC40My43MTUtMi44NjZjMi45NDguNTU4IDUuMTY0LjMzMyA2LjA5Ny0yLjMzMy43NTItMi4xNDYtLjAzNy0zLjM4NS0xLjU4OC00LjE5MiAxLjEzLS4yNiAxLjk4LTEuMDAzIDIuMjA3LTIuNTM4em0tMy45NSA1LjUzOGMtLjUzMyAyLjE0Ny00LjE0OC45ODYtNS4zMi42OTVsLjk1LTMuODA1YzEuMTcyLjI5MyA0LjkyOS44NzIgNC4zNyAzLjExem0uNTM1LTUuNTY5Yy0uNDg3IDEuOTUzLTMuNDk1Ljk2LTQuNDcuNzE3bC44Ni0zLjQ1Yy45NzUuMjQzIDQuMTE4LjY5NiAzLjYxIDIuNzMzeiIvPjwvZz48L3N2Zz4=")',
  bch: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiBmaWxsPSIjOGRjMzUxIiByPSIxNiIvPjxwYXRoIGQ9Ik0yMS4yMDcgMTAuNTM0Yy0uNzc2LTEuOTcyLTIuNzIyLTIuMTUtNC45ODgtMS43MWwtLjgwNy0yLjgxMy0xLjcxMi40OTEuNzg2IDIuNzRjLS40NS4xMjgtLjkwOC4yNy0xLjM2My40MWwtLjc5LTIuNzU4LTEuNzExLjQ5LjgwNSAyLjgxM2MtLjM2OC4xMTQtLjczLjIyNi0xLjA4NS4zMjhsLS4wMDMtLjAxLTIuMzYyLjY3Ny41MjUgMS44M3MxLjI1OC0uMzg4IDEuMjQzLS4zNThjLjY5NC0uMTk5IDEuMDM1LjEzOSAxLjIuNDY4bC45MiAzLjIwNGMuMDQ3LS4wMTMuMTEtLjAyOS4xODQtLjA0bC0uMTgxLjA1MiAxLjI4NyA0LjQ5Yy4wMzIuMjI3LjAwNC42MTItLjQ4Ljc1Mi4wMjcuMDEzLTEuMjQ2LjM1Ni0xLjI0Ni4zNTZsLjI0NyAyLjE0MyAyLjIyOC0uNjRjLjQxNS0uMTE3LjgyNS0uMjI3IDEuMjI2LS4zNGwuODE3IDIuODQ1IDEuNzEtLjQ5LS44MDctMi44MTVhNjUuNzQgNjUuNzQgMCAwMDEuMzcyLS4zOGwuODAyIDIuODAzIDEuNzEzLS40OTEtLjgxNC0yLjg0YzIuODMxLS45OTEgNC42MzgtMi4yOTQgNC4xMTMtNS4wNy0uNDIyLTIuMjM0LTEuNzI0LTIuOTEyLTMuNDcxLTIuODM2Ljg0OC0uNzkgMS4yMTMtMS44NTguNjQyLTMuM3ptLS42NSA2Ljc3Yy42MSAyLjEyNy0zLjEgMi45MjktNC4yNiAzLjI2M2wtMS4wODEtMy43N2MxLjE2LS4zMzMgNC43MDQtMS43MSA1LjM0LjUwOHptLTIuMzIyLTUuMDljLjU1NCAxLjkzNS0yLjU0NyAyLjU4LTMuNTE0IDIuODU3bC0uOTgtMy40MTljLjk2Ni0uMjc3IDMuOTE1LTEuNDU1IDQuNDk0LjU2M3oiIGZpbGw9IiNmZmYiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvZz48L3N2Zz4=")',
  ltc: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE2IDMyYzguODM3IDAgMTYtNy4xNjMgMTYtMTZTMjQuODM3IDAgMTYgMCAwIDcuMTYzIDAgMTZzNy4xNjMgMTYgMTYgMTZ6IiBmaWxsPSIjMzQ1RDlEIi8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC40MjcgMTkuMjE0IDkgMTkuNzY4bC42ODgtMi43NTkgMS40NDQtLjU4TDEzLjIxMyA4aDUuMTI5bC0xLjUxOSA2LjE5NiAxLjQxLS41NzEtLjY4IDIuNzUtMS40MjcuNTcxLS44NDggMy40ODNIMjNMMjIuMTI3IDI0SDkuMjUybDEuMTc1LTQuNzg2eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==")',
  doge: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iI0MzQTYzNCIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xMy4yNDggMTQuNjFoNC4zMTR2Mi4yODZoLTQuMzE0djQuODE4aDIuNzIxYzEuMDc3IDAgMS45NTgtLjE0NSAyLjY0NC0uNDM3LjY4Ni0uMjkxIDEuMjI0LS42OTQgMS42MTUtMS4yMWE0LjQgNC40IDAgMDAuNzk2LTEuODE1IDExLjQgMTEuNCAwIDAwLjIxLTIuMjUyIDExLjQgMTEuNCAwIDAwLS4yMS0yLjI1MiA0LjM5NiA0LjM5NiAwIDAwLS43OTYtMS44MTVjLS4zOTEtLjUxNi0uOTMtLjkxOS0xLjYxNS0xLjIxLS42ODYtLjI5Mi0xLjU2Ny0uNDM3LTIuNjQ0LS40MzdoLTIuNzIxdjQuMzI1em0tMi43NjYgMi4yODZIOXYtMi4yODVoMS40ODJWOGg2LjU0OWMxLjIxIDAgMi4yNTcuMjEgMy4xNDIuNjI3Ljg4NS40MTkgMS42MDcuOTkgMi4xNjggMS43MTUuNTYuNzI0Ljk3NyAxLjU3MiAxLjI1IDIuNTQzLjI3My45NzEuNDA5IDIuMDEuNDA5IDMuMTE1YTExLjQ3IDExLjQ3IDAgMDEtLjQxIDMuMTE1Yy0uMjcyLjk3LS42ODkgMS44MTktMS4yNSAyLjU0My0uNTYuNzI1LTEuMjgyIDEuMjk2LTIuMTY3IDEuNzE1LS44ODUuNDE4LTEuOTMzLjYyNy0zLjE0Mi42MjdoLTYuNTQ5di03LjEwNHoiLz48L2c+PC9zdmc+")',
  trx: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48ZyBmaWxsPSJub25lIj48Y2lyY2xlIGZpbGw9IiNFRjAwMjciIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIvPjxwYXRoIGQ9Ik0yMS45MzIgOS45MTNMNy41IDcuMjU3bDcuNTk1IDE5LjExMiAxMC41ODMtMTIuODk0LTMuNzQ2LTMuNTYyem0tLjIzMiAxLjE3bDIuMjA4IDIuMDk5LTYuMDM4IDEuMDkzIDMuODMtMy4xOTJ6bS01LjE0MiAyLjk3M2wtNi4zNjQtNS4yNzggMTAuNDAyIDEuOTE0LTQuMDM4IDMuMzY0em0tLjQ1My45MzRsLTEuMDM4IDguNThMOS40NzIgOS40ODdsNi42MzMgNS41MDJ6bS45Ni40NTVsNi42ODctMS4yMS03LjY3IDkuMzQzLjk4My04LjEzM3oiIGZpbGw9IiNGRkYiLz48L2c+PC9zdmc+")',
  usdt: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzI2QTE3QiIvPjxwYXRoIGZpbGw9IiNGRkYiIGQ9Ik0xNy45MjIgMTcuMzgzdi0uMDAyYy0uMTEuMDA4LS42NzcuMDQyLTEuOTQyLjA0Mi0xLjAxIDAtMS43MjEtLjAzLTEuOTcxLS4wNDJ2LjAwM2MtMy44ODgtLjE3MS02Ljc5LS44NDgtNi43OS0xLjY1OCAwLS44MDkgMi45MDItMS40ODYgNi43OS0xLjY2djIuNjQ0Yy4yNTQuMDE4Ljk4Mi4wNjEgMS45ODguMDYxIDEuMjA3IDAgMS44MTItLjA1IDEuOTI1LS4wNnYtMi42NDNjMy44OC4xNzMgNi43NzUuODUgNi43NzUgMS42NTggMCAuODEtMi44OTUgMS40ODUtNi43NzUgMS42NTdtMC0zLjU5di0yLjM2Nmg1LjQxNFY3LjgxOUg4LjU5NXYzLjYwOGg1LjQxNHYyLjM2NWMtNC40LjIwMi03LjcwOSAxLjA3NC03LjcwOSAyLjExOCAwIDEuMDQ0IDMuMzA5IDEuOTE1IDcuNzA5IDIuMTE4djcuNTgyaDMuOTEzdi03LjU4NGM0LjM5My0uMjAyIDcuNjk0LTEuMDczIDcuNjk0LTIuMTE2IDAtMS4wNDMtMy4zMDEtMS45MTQtNy42OTQtMi4xMTciLz48L2c+PC9zdmc+")',
  eth: 'url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzYyN0VFQSIvPjxnIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+PHBhdGggZmlsbC1vcGFjaXR5PSIuNjAyIiBkPSJNMTYuNDk4IDR2OC44N2w3LjQ5NyAzLjM1eiIvPjxwYXRoIGQ9Ik0xNi40OTggNEw5IDE2LjIybDcuNDk4LTMuMzV6Ii8+PHBhdGggZmlsbC1vcGFjaXR5PSIuNjAyIiBkPSJNMTYuNDk4IDIxLjk2OHY2LjAyN0wyNCAxNy42MTZ6Ii8+PHBhdGggZD0iTTE2LjQ5OCAyNy45OTV2LTYuMDI4TDkgMTcuNjE2eiIvPjxwYXRoIGZpbGwtb3BhY2l0eT0iLjIiIGQ9Ik0xNi40OTggMjAuNTczbDcuNDk3LTQuMzUzLTcuNDk3LTMuMzQ4eiIvPjxwYXRoIGZpbGwtb3BhY2l0eT0iLjYwMiIgZD0iTTkgMTYuMjJsNy40OTggNC4zNTN2LTcuNzAxeiIvPjwvZz48L2c+PC9zdmc+")',

  tbtc: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE2IDMyQzcuMTYzIDMyIDAgMjQuODM3IDAgMTZTNy4xNjMgMCAxNiAwczE2IDcuMTYzIDE2IDE2LTcuMTYzIDE2LTE2IDE2eiIgZmlsbD0iI0M0QzRDNCIvPjxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgY2xpcC1ydWxlPSJldmVub2RkIiBkPSJNMjIuOTE1IDE0LjAyYy4zMTQtMi4wOTYtMS4yODMtMy4yMjMtMy40NjUtMy45NzVsLjcwOC0yLjg0LTEuNzI4LS40My0uNjkgMi43NjVjLS40NDQtLjExMi0uOTMtLjIyMi0xLjM4NS0uMzI2bC42OTUtMi43ODNMMTUuMzIyIDZsLS43MDggMi44MzktMy40ODYtLjg2NC0uNDYgMS44NDZzMS4yODMuMjk0IDEuMjU2LjMxMmMuNy4xNzUuODI2LjYzOC44MDUgMS4wMDZsLTEuOTM5IDcuNzc5Yy0uMDg2LjIxMi0uMzAzLjUzMS0uNzkzLjQxLjAxOC4wMjUtMS4yNTYtLjMxMy0xLjI1Ni0uMzEzbC0uODU4IDEuOTc4IDMuNDgxLjg3OS0uNzE1IDIuODcyIDEuNzI3LjQzLjcwOC0yLjg0Yy40NzIuMTI3LjkzLjI0NSAxLjM3OC4zNTdsLS43MDYgMi44MjggMS43MjguNDMuNzE1LTIuODY2YzIuOTQ4LjU1OCA1LjE2NC4zMzMgNi4wOTctMi4zMzMuNzUyLTIuMTQ2LS4wMzctMy4zODUtMS41ODgtNC4xOTIgMS4xMy0uMjYgMS45OC0xLjAwMyAyLjIwNy0yLjUzOHptLTguMzIgMi40MjgtLjk1IDMuODA1Yy4wOTcuMDI0LjIxLjA1NC4zMzguMDg4IDEuNDEuMzcyIDQuNDkzIDEuMTg2IDQuOTgyLS43ODMuNTAzLTIuMDEyLTIuNDg0LTIuNjgzLTMuOTQzLTMuMDExLS4xNjQtLjAzNy0uMzA5LS4wNy0uNDI3LS4wOTl6bTEuMjk1LTUuMTkyLS44NiAzLjQ1Yy0uMDktLjAyNC4wNzIuMDE4IDAgMGwuMjg1LjA3NWMxLjE3NS4zMTMgMy43NC45OTggNC4xODUtLjc5Mi40NTctMS44My0yLjAzNS0yLjM4Mi0zLjI1My0yLjY1MWwtLjM1Ny0uMDgyYy4wNTYuMDE0LS4wNjgtLjAxNSAwIDB6IiBmaWxsPSIjZmZmIi8+PC9zdmc+")',
  tltc: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE2IDMyYzguODM3IDAgMTYtNy4xNjMgMTYtMTZTMjQuODM3IDAgMTYgMCAwIDcuMTYzIDAgMTZzNy4xNjMgMTYgMTYgMTZ6IiBmaWxsPSIjQ0FDQUNBIi8+PHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xMC40MjcgMTkuMjE0IDkgMTkuNzY4bC42ODgtMi43NTkgMS40NDQtLjU4TDEzLjIxMyA4aDUuMTI5bC0xLjUxOSA2LjE5NiAxLjQxLS41NzEtLjY4IDIuNzUtMS40MjcuNTcxLS44NDggMy40ODNIMjNMMjIuMTI3IDI0SDkuMjUybDEuMTc1LTQuNzg2eiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==")',
  tbch: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE2IDMyYzguODM3IDAgMTYtNy4xNjMgMTYtMTZTMjQuODM3IDAgMTYgMCAwIDcuMTYzIDAgMTZzNy4xNjMgMTYgMTYgMTZ6IiBmaWxsPSIjQ0FDQUNBIi8+PHBhdGggZD0iTTIxLjIwNyAxMC41MzRjLS43NzYtMS45NzItMi43MjItMi4xNS00Ljk4OC0xLjcxbC0uODA3LTIuODEzLTEuNzEyLjQ5MS43ODYgMi43NGMtLjQ1LjEyOC0uOTA4LjI3LTEuMzYzLjQxbC0uNzktMi43NTgtMS43MTEuNDkuODA1IDIuODEzLTMuNDUuOTk1LjUyNSAxLjgzczEuMjU4LS4zODggMS4yNDMtLjM1OGMuNjk0LS4xOTkgMS4wMzUuMTM5IDEuMi40NjhsMi4yMSA3LjcwNmMuMDMyLjIyNy4wMDQuNjEyLS40OC43NTJsLTEuMjQ2LjM1Ni4yNDcgMi4xNDMgMy40NTQtLjk4LjgxNyAyLjg0NSAxLjcxLS40OS0uODA3LTIuODE1Yy40NTktLjEyMi45MTYtLjI0OCAxLjM3Mi0uMzhsLjgwMiAyLjgwMyAxLjcxMy0uNDkxLS44MTQtMi44NGMyLjgzMS0uOTkxIDQuNjM4LTIuMjk0IDQuMTEzLTUuMDctLjQyMi0yLjIzNC0xLjcyNC0yLjkxMi0zLjQ3MS0yLjgzNi44NDgtLjc5IDEuMjEzLTEuODU5LjY0Mi0zLjMwMXptLS42NSA2Ljc3Yy42MSAyLjEyNy0zLjEgMi45MjktNC4yNiAzLjI2M2wtMS4wODEtMy43N2MxLjE2LS4zMzMgNC43MDQtMS43MSA1LjM0LjUwOGwuMDAxLS4wMDF6bS0yLjMyMi01LjA5Yy41NTQgMS45MzUtMi41NDcgMi41OC0zLjUxNCAyLjg1N2wtLjk4LTMuNDE5Yy45NjYtLjI3NyAzLjkxNS0xLjQ1NSA0LjQ5NC41NjN2LS4wMDF6IiBmaWxsPSIjZmZmIi8+PC9zdmc+")'
};

const fiatCurrencyList = {
  usd: '&#65284',
  rub: '&#8381',
  eur: '&#8364',
  uah: '&#8372',
  gbr: '&#163',
  jpy: '&#165',
  cny: '&#65509',
  ils: '&#8362',
  inr: '&#8360',
  krw: '&#8361',
  kzt: '&#8376',
  pln: 'z&#x142',
  gel: '&#8382',
  ngn: '&#8358',
  thb: '&#3647',
  vnd: '&#8363',
  lak: '&#8365',
  khr: '&#6107',
  mnt: '&#8366',
  php: '&#8369',
  irr: '&#65020',
  yer: '&#65020',
  qar: '&#65020',
  omr: '&#65020',
  sar: '&#65020',
  crc: '&#8353',
  pyg: '&#8370',
  afn: '&#1547',
  ghs: '&#8373',
  try: '&#8378',
  azn: '&#8380',
};

const apironeWidget = {
  donateWidget: '',

  create: () => {
    const donateWidget = document.createElement('div');
    donateWidget.className = '__apr-donate-widget';

    const title = document.createElement('h2');
    title.className = '__apr-widget-title';
    title.innerText = args.title ? args.title : '';

    const contentUnit = document.createElement('div');
    contentUnit.className = '__apr-content-unit';

    const prevNextButtonContainer = document.createElement('div');
    prevNextButtonContainer.className = '__apr-btn-container';
    prevButtonElem.create();
    nextButtonElem.create();
    prevButtonElem.insert(prevNextButtonContainer);
    nextButtonElem.insert(prevNextButtonContainer);

    formPage.create();
    const formPageElem = formPage.getElem();
    formPageElem.className = '__apr-form-page active';

    qrPage.create();``
    const qrPageElem = qrPage.getElem();
    qrPageElem.className = '__apr-qr-page';

    const errorPage = document.createElement('div');
    errorPage.className = '__apr-error-page';

    const completePage = document.createElement('div');
    completePage.className = '__apr-complete-page';

    contentUnit.append(formPageElem, qrPageElem, errorPage, completePage);

    donateWidget.append(title, contentUnit, prevNextButtonContainer);
    apironeWidget.donateWidget = donateWidget;
  },

  insert: () => {
    donateWidget.append(apironeWidget.donateWidget);
  },
};


const formPage = {
  formPageElem: '',
  create: () => {
    const formPageElem = document.createElement('div');

    const description = document.createElement('p');
    description.className = '__apr-description';
    description.innerText = args.description ? args.description : '';

    amountsButtons.create();
    dropDown.create();

    formPageElem.append(description);
    amountsButtons.insert(formPageElem);
    dropDown.insert(formPageElem);

    formPage.formPageElem = formPageElem;
  },

  getElem: () => {
    return formPage.formPageElem;
  },
};


const amountsButtons = {
  amounts: [...args.amounts.split(' '), ...['∞']],
  amountValue: '',
  buttonsContainer: '',

  create: () => {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = '__apr-amount-btn-container';

    amountsButtons.amounts.forEach((item, i) => {
      if (Number(item) && Number(item) > 0 || item === '∞') {
        const labelElem = document.createElement('label');
        labelElem.className = '__apr-amount-btn';

        const hiddenRadio = document.createElement('input');
        hiddenRadio.className = '__apr-hidden-radio';
        hiddenRadio.type = 'radio';
        hiddenRadio.name = 'amount';
        hiddenRadio.value = item;
        if (i === 0) {
          hiddenRadio.checked = true;
          amountsButtons.amountValue = hiddenRadio.value;
        }

        const customRadio = document.createElement('span');
        customRadio.className = '__apr-custom-radio';

        if (fiatCurrencyList[args['fiat-currency'].toLowerCase()]) {
          customRadio.innerHTML = item === '∞' ? item : `${item} ${fiatCurrencyList[args['fiat-currency'].toLowerCase()]}`
        }  else {
          customRadio.innerHTML = item === '∞' ? item : `${item} ${args['fiat-currency'].toUpperCase()}`;
        }

        hiddenRadio.addEventListener('input', () => {
          if (hiddenRadio.checked === true) {
            amountsButtons.amountValue = hiddenRadio.value;
          }
        });

        labelElem.append(hiddenRadio, customRadio);
        buttonsContainer.append(labelElem);
      } else {
        const error = new Error(`incorrect amount value ("${item}")`)
        console.log(error);
      }
    });

    amountsButtons.buttonsContainer = buttonsContainer;
  },

  insert: where => {
    where.append(amountsButtons.buttonsContainer);
  },
};


const dropDown = {
  currencies: [],
  dropDownElem: '',
  currencyValue: '',

  create: () => {
    const selectWrapper = document.createElement('div');
    selectWrapper.style.position = 'relative';

    const selectCustom = document.createElement('div');
    selectCustom.className = '__apr-custom-select';

    const button = document.createElement('button');
    button.className = '__apr-custom-select-btn';

    button.addEventListener('focus', () => {
      selectCustom.style.outline = `3px solid #${args['primary-color'] ? args['primary-color'] : '397cb0'}53`;
    });
    button.addEventListener('blur', () => {
      selectCustom.style.outline = '';
    });

    const parentElemWidth = elementSizes.widgetWidth > 600 ? 600 - 48 * 2 : elementSizes.widgetWidth - 48 * 2;
    elementSizes.coinContainerWidth = parentElemWidth - 34 - elementSizes.dropdownBtnWidth;
    elementSizes.columns = Math.floor(elementSizes.coinContainerWidth / (elementSizes.coinWidth + 10));
    elementSizes.gapWidth = (elementSizes.coinContainerWidth - elementSizes.columns * elementSizes.coinWidth)/(elementSizes.columns - 1);
    const rows = Math.ceil(dropDown.currencies.length / elementSizes.columns);
    elementSizes.selectCustomHeight = (elementSizes.coinWidth * rows) + (rows + 1) * 8 + 2;

    const selectCustomList = document.createElement('div');
    selectCustomList.className = '__apr-dropdown-list';

    dropDown.currencies.forEach((elem) => {
      const selectCustomListItem = document.createElement('button');
      selectCustomListItem.className = '__apr-select-list-item';
      selectCustomListItem.value = elem;
      selectCustomListItem.disabled = true;
      selectCustomListItem.title = elem;
      selectCustomListItem.style.backgroundImage = coinIcons[elem];

      if (args['default-crypto'] && args['default-crypto'].toLowerCase() === elem) {
        dropDown.currencyValue = selectCustomListItem.value;
        button.style.backgroundImage = selectCustomListItem.style.backgroundImage;
        nextButtonElem.buttonElem.disabled = false;
      }

      selectCustomListItem.addEventListener('click', e => {
        e.stopPropagation();
        dropDown.currencyValue = selectCustomListItem.value;
        button.style.backgroundImage = selectCustomListItem.style.backgroundImage;
        selectCustom.classList.remove('active');
        showOrHideList();
        nextButtonElem.buttonElem.disabled = false;
      });

      selectCustomList.append(selectCustomListItem);
    });

    const arrow = document.createElement('span');
    arrow.className = '__apr-select-arrow';

    selectCustom.append(button, selectCustomList, arrow);

    selectCustom.addEventListener('click', () => {
      selectCustom.classList.toggle('active');
      showOrHideList();
    });

    function showOrHideList() {
      if (selectCustom.classList.contains('active')) {
        selectCustomList.childNodes.forEach((elem) => {
          elem.disabled = false;
        });
      } else {
        selectCustomList.childNodes.forEach((elem) => {
          elem.disabled = true;
        });
      }
    }

    document.addEventListener('click', (e) => {
      if (e.target !== button) {
        selectCustom.classList.remove('active');
        showOrHideList();
      }
    });

    selectWrapper.append(selectCustom);
    dropDown.dropDownElem = selectWrapper;
  },

  insert: where => {
    where.append(dropDown.dropDownElem);
  },
};


const nextButtonElem = {
  buttonElem: '',

  create: () => {
    const nextButton = document.createElement('button');
    nextButton.className = '__apr-next-button';
    nextButton.type = 'button';
    nextButton.disabled = 'true';

    nextButton.addEventListener('click', () => {
      nextButton.style.display = 'none';
      const prevButton = donateWidget.querySelector('.__apr-prev-button');
      prevButton.style.display = 'block';

      showPage('__apr-qr-page');
      conversion(amountsButtons.amountValue, dropDown.currencyValue);
    });

    nextButtonElem.buttonElem = nextButton;
  },

  insert: where => {
    where.append(nextButtonElem.buttonElem);
  },
};

const prevButtonElem = {
  buttonElem: '',

  create: () => {
    const prevButton = document.createElement('button');
    prevButton.className = '__apr-prev-button';
    prevButton.type = 'button';

    prevButton.addEventListener('click', () => {
      prevButton.style.display = 'none';
      const nextButton = donateWidget.querySelector('.__apr-next-button');
      nextButton.style.display = 'block';

      showPage('__apr-form-page');
      clearInterval(actualIntervalId);
    });
    prevButtonElem.buttonElem = prevButton;
  },

  insert: where => {
    where.append(prevButtonElem.buttonElem);
  },
};

const qrPage = {
  qrPageElem: '',
  address: '',
  currencyIcon: '',
  qrWrapper: '',

  create: () => {
    const qrPageElem = document.createElement('div');

    const qrWrapper = document.createElement('div');
    qrWrapper.className = '__apr-qr-wrapper';
    qrWrapper.innerHTML = '<img alt="">';

    const addressLink = document.createElement('div');
    addressLink.className = '__apr-wallet-link';

    const conversion = document.createElement('p');
    conversion.className = '__apr-conversion';

    qrPage.qrWrapper = qrWrapper;
    qrPage.qrPageElem = qrPageElem;
    qrPageElem.append(qrWrapper, addressLink, conversion);
  },

  getElem: () => {
    return qrPage.qrPageElem;
  },
};


function expand() {
  const currencies = [];

  const error = error => {
    console.log('error', error);
  };

  fetch(`${baseUrl}/api/v2/wallets`, { method: 'OPTIONS' })
    .then(response => {
      if (response.status !== 200) {
        return Promise.reject(new Error(response.statusText));
      }
      return Promise.resolve(response);
    })
    .then(response => response.json())
    .then(result => {
      result.currencies.forEach(item => {
        if (!item.name.includes('testnet') || args['debug-mode'] === 'true') {
          currencies.push(item.abbr);
          currencyNames[item.abbr] = formatName(item.name);
        }
      });
      dropDown.currencies = currencies;
    })
    .then(apironeWidget.create)
    .then(apironeWidget.insert)
    .then(addStyles)
    .catch(error);
}


getElemWidth(donateWidget);


function getElemWidth(elem) {
  if (elem.offsetWidth > 0) {
    elementSizes.widgetWidth = elem.offsetWidth;
    expand();
  } else {
    const styles = getComputedStyle(elem.parentNode);
    if (isHasTheProperty(styles, 'width')) {
      elementSizes.widgetWidth = parseInt(styles.width, 10);
      expand();
    } else if (isHasTheProperty(styles, 'maxWidth')) {
      elementSizes.widgetWidth = parseInt(styles.maxWidth, 10);
      expand();
    } else {
      getElemWidth(elem.parentNode);
    }
  }
}


function isHasTheProperty(styleObj, property) {
  if (styleObj[property] !== '100%'
    && styleObj[property] !== 'none'
    && styleObj[property] !== 'inherit'
    && styleObj[property] !== 'fit-content'
    && styleObj[property] !== 'max-content'
    && styleObj[property] !== 'min-content'
    && styleObj[property] !== 'initial'
    && styleObj[property] !== 'unset'
    && styleObj[property] !== 'auto') {
      return true
  } 
  return false
}


function showComletePage() {
  const completePage = document.querySelector('.__apr-complete-page');
  const newcompletePage = document.createElement('div');

  newcompletePage.innerHTML = `<svg width="138" height="138" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M133 68.957C132.977 33.6306 104.332 5 69 5C33.6538 5 5 33.6538 5 69C5 104.346 33.6538 133 69 133C104.331 133 132.976 104.37 133 69.0447" stroke="#5EAC24" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" class="svg-elem-1"></path>
  <path d="M42 67.1634L64.7709 89.9342L99.9342 54.7709" stroke="#5EAC24" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" class="svg-elem-2"></path>
  </svg>`;

  completePage.innerHTML = newcompletePage.innerHTML;
  showPage('__apr-complete-page');
  setTimeout(() => {
    document.querySelector('.__apr-complete-page svg').classList.add('active');
  }, 100);
}


function showErrorPage() {
  const errorPage = document.querySelector('.__apr-error-page');

  const newErrorPage = document.createElement('div');
  newErrorPage.innerHTML = `<svg width="138" height="138" viewBox="0 0 138 138" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M133 68.957C132.977 33.6306 104.332 5 69 5C33.6538 5 5 33.6538 5 69C5 104.346 33.6538 133 69 133C104.331 133 132.976 104.37 133 69.0447" stroke="#D00000" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" class="svg-elem-1"></path>
  <line x1="5" y1="-5" x2="62.8822" y2="-5" transform="matrix(-0.707107 0.707107 0.707107 0.707107 96.3966 48)" stroke="#D00000" stroke-width="10" stroke-linecap="round" class="svg-elem-2"></line>
  <line x1="49.6745" y1="48" x2="90.6034" y2="88.9289" stroke="#D00000" stroke-width="10" stroke-linecap="round" class="svg-elem-3"></line>
  </svg>`;

  errorPage.innerHTML = newErrorPage.innerHTML;
  showPage('__apr-error-page');
  setTimeout(() => {
    document.querySelector('.__apr-error-page svg').classList.add('active');
  }, 100);
}


function createInvoice(currency, amount) {
  if (!(invoices[currency]) || invoices[currency].status !== 'created') {
    const url = `${baseUrl}/api/v2/accounts/${args.acc}/invoices`;
    const data = {
      'currency': currency
    };
    const error = error => {
      console.log('error', error);
      showErrorPage();
    };

    fetch(url, {
      method: 'post',
      body: JSON.stringify(data),
      headers: {
        'content-type': 'application/json;charset=utf-8',
      },
    })
      .then(response => {
        if (response.status !== 200) {
          return Promise.reject(new Error(response.statusText));
        }
        return Promise.resolve(response);
      })
      .then (response => response.json())
      .then (data => {
        qrPage.address = data.address;
        generateQr(amount);
        invoices[currency] = data;
        checkInvoiceStratus(data.invoice);
      })
      .then (getWalletLink)
      .catch(error);
  } else {
    qrPage.address = invoices[currency].address;
    checkInvoiceStratus(invoices[currency].invoice);
    getWalletLink();
    generateQr(amount);
  }
}


function getWalletLink() {
  if (qrPage.address) {
    const walletLink = donateWidget.querySelector('.__apr-wallet-link');

    const walletAddress = document.createElement('a');
    walletAddress.href = formatAddress(qrPage.address, true, currencyNames[dropDown.currencyValue]);
    walletAddress.className = '__apr-wallet-address';
    walletAddress.innerHTML = formatAddress(qrPage.address);

    const externalLinkIcon = document.createElement('a');
    externalLinkIcon.className = '__apr-address-link';
    externalLinkIcon.href = `https://blockchair.com/${currencyNames[dropDown.currencyValue]}/address/${formatAddress(qrPage.address)}`;
    externalLinkIcon.target = '_blank';

    const copyAddressBtn = document.createElement('button');
    copyAddressBtn.className = '__apr-copy-btn';
    copyAddressBtn.id = '__apr-address-copy';
    copyAddressBtn.addEventListener('click', copyToClipboard);

    const newWalletLink = document.createElement('div');
    newWalletLink.className = '__apr-wallet-link';
    newWalletLink.append(externalLinkIcon, walletAddress, copyAddressBtn);

    walletLink.replaceWith(newWalletLink);
  }
}


function copyToClipboard(e) {
  if (e.target.id === '__apr-address-copy') {
    navigator.clipboard.writeText(qrPage.address);
  } else if (e.target.id === '__apr-amount-copy') {
    navigator.clipboard.writeText(document.querySelector('.__apr-conversion-result').innerText);
  }
  e.target.classList.add('animate');
  setTimeout(() => {
    e.target.classList.remove('animate');
  }, 1200);
}


function generateQr(amount) {
  const qrWrapper = donateWidget.querySelector('.__apr-qr-wrapper img');
  let message = formatAddress(qrPage.address, true, currencyNames[dropDown.currencyValue]);

  if (!isNaN(amount)) {
    message += `?amount=${amount}`;
  };

  const qrCode = document.createElement('img');
  qrCode.style.width = '100%';
  qrCode.src = `https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=${message}`;
  qrCode.alt = 'QR-code';

  qrWrapper.replaceWith(qrCode);
}


function conversion(inputNum, currency) {
  const outputNum = qrPage.qrPageElem.querySelector('.__apr-conversion');
  const error = error => {
    showErrorPage();
    console.log('error', error);
  };
  fetch(`${baseUrl}/api/v2/ticker?currency=${currency}`)
    .then(response => {
      if (response.status !== 200) {
        return Promise.reject(new Error(response.statusText));
      }
      return Promise.resolve(response);
    })
    .then(response => response.json())
    .then(data => {
      if (!isNaN(inputNum) && data[args['fiat-currency'].toLowerCase()]) {
        const result = inputNum / data[args['fiat-currency'].toLowerCase()];
        const resultText = `${result > 1 ? result.toFixed(2) : result.toPrecision(2)}`;

        const conversion = document.createElement('p');
        conversion.className = '__apr-conversion';
        const conversionIcon = document.createElement('span');
        conversionIcon.className = '__apr-conversion-icon';
        conversionIcon.style.backgroundImage = coinIcons[dropDown.currencyValue];
        const conversionResult = document.createElement('span');
        conversionResult.className = '__apr-conversion-result';
        conversionResult.innerText = resultText;

        const copyAmountBtn = document.createElement('button');
        copyAmountBtn.className = '__apr-copy-btn';
        copyAmountBtn.id = '__apr-amount-copy';
        copyAmountBtn.addEventListener('click', copyToClipboard);

        conversion.append(conversionIcon, conversionResult, copyAmountBtn);
        outputNum.replaceWith(conversion);
        createInvoice(dropDown.currencyValue, resultText);
      } else if (data[args['fiat-currency'].toLowerCase()]) {
        outputNum.innerHTML = '';
        createInvoice(dropDown.currencyValue);
      } else {
        error('fiat-currency not supported or entered incorrectly')
      }
    })
    .catch(error);
}


function checkInvoiceStratus(invoiceId) {
  const url = `${baseUrl}/api/v2/invoices/${invoiceId}`;

  const error = error => {
    showErrorPage();
    console.log('error', error);
  };

  const intervalId = setInterval(() => {
    fetch (url)
      .then(response => {
        if (response.status !== 200) {
          return Promise.reject(new Error(response.statusText))
        }
        return Promise.resolve(response);
      })
      .then(response => response.json())
      .then(result => {
        if (result.status !== 'created') {
          showComletePage();
          invoices[result.currency].status = result.status;
          clearInterval(intervalId);
        }
      })
      .catch(error);
  }, 3000);
  actualIntervalId = intervalId;
}


function showPage(className) {
  const pages = document.querySelector('.__apr-content-unit').childNodes;
  const title = document.querySelector('.__apr-widget-title');

  pages.forEach((elem) => {
    if (elem.classList.contains(className)) {
      elem.classList.add('active');
    } else {
      elem.classList.remove('active');
    }
  });
  if (className === '__apr-qr-page' || className === '__apr-form-page') {
    title.style.display = 'block';
  } else {
    title.style.display = 'none';
  }
}


function addStyles() {
  const styles = document.createElement('style');
  styles.setAttribute('scoped', 'scoped')
  styles.innerHTML = `
  .__apr-donate-widget {
    box-sizing: border-box;
    max-width: 600px;
    min-height: 37rem;
    border-radius: ${args['border-radius']}px;
    -webkit-box-shadow:4px 4px 8px 0px #223c5033;
    -moz-box-shadow: 4px 4px 8px 0px #223c5033;
    background: #fff;
    box-shadow:4px 4px 8px 0px #223c5033;
    padding: 48px;
    margin: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  } 
  .__apr-widget-title {
    font-size: 2rem;
    font-weight: 400;
    padding: 0;
    margin: 0 0 0.5rem;
  }
  .__apr-content-unit {
    padding: 0;
    margin: 0 0 auto 0;
  }
  .__apr-form-page,
  .__apr-qr-page,
  .__apr-error-page,
  .__apr-complete-page {
    padding: 0;
    margin: 0;
    display: none;
  }
  .__apr-form-page.active,
  .__apr-qr-page.active {
    display: block;
  }
  .__apr-error-page.active,
  .__apr-complete-page.active {
    padding: 0;
    margin: 20% 0 0 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .__apr-description {
    line-height: 150%;
    padding: 0;
    margin: 0 0 1.5rem 0;
  }
  .__apr-amount-btn-container {
    display: grid;
    grid-template-columns:
    repeat(auto-fit, minmax(5rem, 1fr));
    grid-gap: 0.5rem;
    padding: 0;
    margin: 0 0 1.5rem 0;
  }
  .__apr-amount-btn {
    padding: 0;
    margin: 0;
    cursor:pointer;
  }
  .__apr-hidden-radio {
    padding: 0;
    margin: 0;
    position: absolute;
    opacity: 0;
  } 
  .__apr-hidden-radio:focus + .__apr-custom-radio{
    outline: 3px solid #${args['primary-color'] ? args['primary-color'] : '397cb0'}53
  }
  .__apr-hidden-radio:checked + .__apr-custom-radio{
    background-color: #${args['primary-color'] ? args['primary-color'] : '397cb0'};
    color: #fff;
  }
  .__apr-custom-radio:hover {
    opacity: 0.7
  }
  .__apr-custom-radio {
    display: block;
    padding: 0.5rem;
    margin: 0;
    text-align: center;
    border: 1px solid #${args['primary-color'] ? args['primary-color'] : '397cb0'};
    border-radius: ${args['border-radius']}px
  }
  .__apr-custom-select {
    box-sizing: border-box;
    top: 0;
    left: 0;
    width: ${elementSizes.dropdownBtnWidth + 10}px;
    height: ${elementSizes.coinWidth + 18}px;
    padding: 8px 24px 8px 8px;
    margin: 0;
    display: flex;
    align-items:
    flex-start;
    border: 1px solid #${args['primary-color'] ? args['primary-color'] : '397cb0'};
    border-radius: ${args['border-radius']}px;
    transition: width 0.5s ease, height 0.5s ease;
    overflow: hidden;
    position: absolute;
    background-color: #fff;
    z-index: 2; cursor: pointer;
  } 
  .__apr-custom-select-btn {
    height: ${elementSizes.coinWidth}px;
    padding: 0 ${elementSizes.dropdownBtnWidth}px 0 0;
    margin: 0 auto 0 0;
    cursor: pointer;
    background: none;
    border: none;
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none"%3E%3Cpath fill-rule="evenodd" clip-rule="evenodd" d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.189-17.98c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.746-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538zm-3.95 5.538c-.533 2.147-4.148.986-5.32.695l.95-3.805c1.172.293 4.929.872 4.37 3.11zm.535-5.569c-.487 1.953-3.495.96-4.47.717l.86-3.45c.975.243 4.118.696 3.61 2.733z" fill="%23F1F1F1"/%3E%3C/svg%3E');
    background-position: center left;
    background-size: contain;
    background-repeat: no-repeat;
    outline: none;
  }
  .__apr-dropdown-list {
    width:${elementSizes.coinContainerWidth}px;
    padding: 0;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(${elementSizes.columns}, 1fr);
    grid-template-rows: ${elementSizes.coinWidth}px;
    grid-gap: 8px ${elementSizes.gapWidth}px
  }
  .__apr-select-list-item {
    padding: 0.1rem;
    margin: 0;
    height: 2.2rem;
    width: 2.2rem;
    cursor: pointer;
    background-color: transparent;
    border: none;
    background-position: center;
    background-repeat: no-repeat;
    background-size: 2rem;
    border-radius: ${args['border-radius']}px;
    transition: background-size .15s ease-in
  }
  .__apr-select-list-item:hover {
    background-size: ${elementSizes.coinWidth}px;
  }
  .__apr-select-list-item:focus {
    outline: 1px solid #${args['primary-color'] ? args['primary-color'] : '397cb0'}53;
    background-color: #${args['primary-color'] ? args['primary-color'] : '397cb0'}53;
  }
  .__apr-select-arrow {
    pointer-events: none;
    position: absolute;
    right: 0.7rem;
    top: 1.2rem;
    width: 8px;
    height: 12px;
    padding: 0;
    margin: 0;
    background: url("data:image/svg+xml,%3Csvg width='8' height='12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7.5 6 0 0v12l7.5-6z' fill='%23D1D1D1'/%3E%3C/svg%3E") no-repeat center
  }
  .__apr-custom-select.active {
    width: 100%;
    height: ${elementSizes.selectCustomHeight}px;
  }
  .__apr-custom-select.active .__apr-select-arrow {
    transform: rotate(180deg);
  }
  .__apr-next-button,
  .__apr-prev-button {
    width: 3rem;
    height: 3rem;
    padding: 0;
    margin: 0;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 44%;
    border: none;
    border-radius: ${args['border-radius']}px;
    transition: background, opacity;
    transition-timing-function: linear;
    transition-duration: 0.25s;
    cursor: pointer;
  }
  .__apr-next-button:disabled,
  .__apr-next-button:disabled:hover {
    opacity: 0.2;
    cursor: not-allowed;
  }
  .__apr-next-button {
    padding: 0;
    margin: 0 0 0 auto;
    display: block;
    background-color:#${args['primary-color'] ? args['primary-color'] : '397cb0'};
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='23' height='24' fill='none'%3E%3Cpath d='M2 10.5a1.5 1.5 0 0 0 0 3v-3zm20.06 2.56a1.5 1.5 0 0 0 0-2.12l-9.545-9.547a1.5 1.5 0 1 0-2.122 2.122L18.88 12l-8.486 8.485a1.5 1.5 0 1 0 2.122 2.122l9.546-9.546zM2 13.5h19v-3H2v3z' fill='%23fff'/%3E%3C/svg%3E")
  }
  .__apr-prev-button {
    padding: 0;
    margin: 0 auto 0 0;
    display: none;
    background-color: #fff;
    background-image: url("data:image/svg+xml,%3Csvg width='23' height='24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M21 10.5a1.5 1.5 0 1 1 0 3v-3zM.94 13.06a1.5 1.5 0 0 1 0-2.12l9.545-9.547a1.5 1.5 0 1 1 2.122 2.122L4.12 12l8.486 8.485a1.5 1.5 0 1 1-2.122 2.122L.938 13.061l.002-.001zM21 13.5H2v-3h19v3z' fill='%23${args['primary-color'] ? args['primary-color'] : '397cb0'}'/%3E%3C/svg%3E");
    border: #${args['primary-color'] ? args['primary-color'] : '397cb0'} 2px solid;
  }
  .__apr-next-button:hover,
  .__apr-prev-button:hover {
    opacity: 0.7;
    background-size: 45%
  }
  .__apr-next-button:focus,
  .__apr-prev-button:focus {
    outline: 3px solid #${args['primary-color'] ? args['primary-color'] : '397cb0'}53
  }
  .__apr-qr-wrapper {
    max-width: 300px;
    width: 100%;
    height: auto;
    aspect-ratio: 1/1;
    padding: 0;
    margin: 0 auto 1.2rem;
    border-radius: ${args['border-radius']}px;
    border: 1px solid #${args['primary-color'] ? args['primary-color'] : '397cb0'}4d;
    background-size: cover;
    overflow: hidden;
    background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjI4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAwaDI4MHYyODBIMFYweiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0zNyAzN2g1MHY1MEgzN1YzN3oiIGZpbGw9IiNGM0YzRjMiLz48cGF0aCBkPSJNNDUgNDVoMzV2MzVINDVWNDV6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTUyIDUyaDIwdjIwSDUyVjUyek0zNyAxOTFoNTB2NTBIMzd2LTUweiIgZmlsbD0iI0YzRjNGMyIvPjxwYXRoIGQ9Ik00NSAxOTloMzV2MzVINDV2LTM1eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik01MiAyMDZoMjB2MjBINTJ2LTIwek0xOTEgMzdoNTB2NTBoLTUwVjM3eiIgZmlsbD0iI0YzRjNGMyIvPjxwYXRoIGQ9Ik0xOTkgNDVoMzV2MzVoLTM1VjQ1eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yMDYgNTJoMjB2MjBoLTIwVjUyeiIgZmlsbD0iI0YzRjNGMyIvPjxwYXRoIGQ9Ik05My41IDk0VjM3LjVIMTg0Vjk0aDU3djE0Ny41SDkzLjVWMTg0SDM3Vjk0aDU2LjV6IiBmaWxsPSIjRjNGM0YzIi8+PHBhdGggZD0ibTkwLjUxNCAxMjYtOS41ODUgMTIuMDk4SDY1TDc0LjU4NSAxMjZoMTUuOTI5em0tNC42NzcgMi4zMTNINzUuNzJsLTYuMDkgNy42MzRoMTAuMTE4bDYuMDg5LTcuNjM0em0tNC45MDggMTEuNTY2TDkwLjUxNCAxNTJINzQuNTg1TDY1IDEzOS44NzloMTUuOTI5em0tMS4xOCAyLjMxM0g2OS42M2w2LjA4OSA3LjYzNGgxMC4xMTdsLTYuMDg5LTcuNjM0aC4wMDJ6bTEyLjg3Mi0xNC4zNDEgOC44OTEgMTEuMDU2LTguODY4IDExLjEwNC0xLjU5Ny0yLjAzNiA2LjMyLTcuODY1SDg0LjcwM2wtLjk1LTEuMjAzLjk1LTEuMTMzaDEyLjkxOWwtNi42NDUtNy44NDIgMS42NDQtMi4wODF6bTI4LjY0IDYuNjYxYy4wMTEuMTA4LjAxMS4yMTcgMCAuMzI0LjAwNC4xMDktLjAwNC4yMTctLjAyMy4zMjRsLS44OCAxMC45ODhoLTMuMTQ5bC0uMzctMS4yNDlhOS4wNjUgOS4wNjUgMCAwIDEtMS44MyAxLjA2NCA0Ljk0MyA0Ljk0MyAwIDAgMS0yLjAzNy40ODVoLS43NjRhNC4yMjMgNC4yMjMgMCAwIDEtMi4wODQtLjYyNCAzLjE2MiAzLjE2MiAwIDAgMS0uOTcyLTEuMDE4IDMuODA5IDMuODA5IDAgMCAxLS41MDktMS42NjUgMS42NSAxLjY1IDAgMCAxIDAtLjQ4NmMwLS4xODUuMDIzLS4zOTMuMDQ2LS42NzFsLjA2OS0uODc5Yy4wMzctLjQwNC4wOTgtLjgwNi4xODYtMS4yMDMuMTAyLS40NzUuMzE2LS45MTkuNjI1LTEuMjk1YTMuODA2IDMuODA2IDAgMCAxIDEuNDEyLTEuMDQxYy42MjUtLjI3OCAxLjQ4Mi0uNDE3IDIuNTctLjQxN2gzLjQyNmwuMDctLjcxN2ExLjEyIDEuMTIgMCAwIDAgLjAyMy0uMjc3di0uMjA4YS40MS40MSAwIDAgMC0uMjA4LS4zNy42NTYuNjU2IDAgMCAwLS4zNDgtLjA5M2gtNS4zNDhsLjI1NS0zLjM3N2g3LjAxNWMuOTcyIDAgMS42NjcuMjMxIDIuMTA3LjY5NC40MzYuNDY2LjY5MSAxLjA3NC43MTggMS43MTF6bS04LjAxMSA1LjQzNmEuNTkzLjU5MyAwIDAgMC0uNjAyLjU1NmwtLjEzOSAxLjIwMmE0LjI5NiA0LjI5NiAwIDAgMC0uMDIzLjUzMmMuMDMuMjA5LjEwOS40MDcuMjMxLjU3OS4xMzkuMjA4LjM5NC4zLjc4OC4zYTYuNjU3IDYuNjU3IDAgMCAwIDEuNTUxLS4yMDggNi41MTcgNi41MTcgMCAwIDAgMS41MjgtLjUzMmwuMTYyLTIuNDA1LTMuNDk2LS4wMjR6bTIzLjUtNC4yNzlhMTAuOSAxMC45IDAgMCAxIDAgMS4yMjZsLS4zNDggNC40ODhjLS4xMTUgMS40NTctLjU1NSAyLjYxMy0xLjM0MiAzLjQ5Mi0uNzg4Ljg3OS0xLjg5OSAxLjMxOS0zLjM1OCAxLjMxOWgtNC44MzhsLS4zMjUgMy45MzJoLTQuMTQ0bDEuNDM2LTE4LjAxOWgzLjM4bC4zOTMgMS4wNDFjLjMyNS0uMTM5LjcxOC0uMjc4IDEuMTU4LS40NC40NC0uMTYyLjkwMy0uMzAxIDEuMzg5LS40MzkuNDg2LS4xMzkuOTczLS4yMzIgMS40NTktLjMyNC40NTgtLjA5LjkyMy0uMTM2IDEuMzg5LS4xMzlhMy41NzIgMy41NzIgMCAwIDEgMS41MDUuMzAxYy40MzUuMjAyLjgyOC40ODQgMS4xNTguODMyLjMyOC4zNTguNTg3Ljc3NC43NjQgMS4yMjYuMTcuNDg2LjI3OS45OTEuMzI0IDEuNTA0em0tNC4xMjEgMS4xOGExLjMzOCAxLjMzOCAwIDAgMC0uMzAxLS44MWMtLjE4Ni0uMjA4LS41MS0uMzAxLS45NzMtLjMwMS0uMjQuMDA4LS40OC4wMzEtLjcxOC4wN2wtMS4wMTguMTM5Yy0uMzQ4LjA2OS0uNzE4LjExNS0xLjA2NS4xODUtLjM0OC4wNjktLjY0OS4xMzgtLjg4LjE4NWwtLjUwOSA2LjE5OWg0LjQ5MWEuNTIzLjUyMyAwIDAgMCAuNTc5LS41NTVsLjM0Ny00LjQ0MWMuMDIxLS4xMTUuMDI5LS4yMzEuMDIzLS4zNDcuMDE3LS4xMDcuMDI1LS4yMTYuMDI0LS4zMjR6bTkuODg2IDkuMzIyaC00LjI2bDEuMTM0LTE0LjA4N2g0LjI2bC0xLjEzNCAxNC4wODd6bTEuMzg5LTE1Ljc1M2gtNC40OTJsLjIwOS0yLjU2N2g0LjQ5MWwtLjIwOCAyLjU2N3ptMTAuMjEgNS4zNDRoLS41MzJhOC4yODcgOC4yODcgMCAwIDAtMi4wMTUuMjMxYy0uNjQ4LjE2Mi0xLjIwNC4zMDEtMS42NDMuNDYzbC0uNzg4IDkuNzE1aC00LjI4M2wxLjEzNS0xNC4wODdoMy40OTZsLjM3IDEuMTU2Yy4zMzEtLjE4LjY3MS0uMzQyIDEuMDE5LS40ODYuMzctLjE2MS43NjQtLjMyMyAxLjE4MS0uNDYyLjQwMi0uMTQ1LjgxMS0uMjY4IDEuMjI3LS4zN2E1LjM2IDUuMzYgMCAwIDEgMS4xNTctLjEzOWwtLjMyNCAzLjk3OXptMTQuNzcxIDUuNjIxYy0uMDkyIDEuNDExLS41MzIgMi41NjctMS4yOTYgMy40NjktLjc2NC45MDItMS44NzUgMS4zNDItMy4zNTcgMS4zNDJoLTUuNjczYy0uOTk1IDAtMS43ODItLjI3OC0yLjMzOC0uODMzLS41NTYtLjU1NS0uODgtMS4zMTgtLjk3Mi0yLjMxM2ExLjY1IDEuNjUgMCAwIDEgMC0uNDg2YzAtLjEzOS4wMjMtLjQxNi4wNDYtLjgwOWwuMzQ3LTQuODU4YTYuMjg2IDYuMjg2IDAgMCAxIC4zOTQtMS44OTcgNC4wNzkgNC4wNzkgMCAwIDEgMi4zNjEtMi41MjEgNS40MTkgNS40MTkgMCAwIDEgMi4wMzgtLjM3aDUuNjQ5Yy45NzIgMCAxLjczNi4zMjQgMi4yNjkuOTcxLjU0OC43MDYuODcxIDEuNTYxLjkyNiAyLjQ1MiAwIC4xMzkuMDIzLjMwMS4wMjMuNDYzLjAwNS4xNjItLjAwMy4zMjUtLjAyMy40ODZsLS4zOTQgNC45MDR6bS0zLjcwNC00LjcxOWEuNzcyLjc3MiAwIDAgMC0uMzI0LS42MjUgMS4xMjggMS4xMjggMCAwIDAtLjY5NS0uMjA4aC0zLjg0M2MtLjM0NyAwLS41MzIuMTg1LS41NTYuNTU1bC0uMzI0IDQuMzk1Yy0uMDIuMTA3LS4wMjguMjE1LS4wMjMuMzI0di4zMDFjLjAxLjIyOS4xMS40NDUuMjc4LjYwMS4yMDcuMTcyLjQ3My4yNTUuNzQxLjIzMWgzLjc5N2EuNTEuNTEgMCAwIDAgLjQyLS4xNDEuNTEuNTEgMCAwIDAgLjE1OS0uNDE0bC4zNDctNC41NTdhMS4xMiAxLjEyIDAgMCAwIC4wMjMtLjI3N3YtLjE4NXptMTkuNjMzLTEuMzY1Yy4wMjQuMjMxLjAyNC40ODYuMDI0Ljc0IDAgLjI1NS0uMDI0LjU1NS0uMDI0Ljg1NmwtLjcxNyA5LjI3NmgtNC4xNjhsLjY0OS04LjM3NGMuMDI5LS4yNjkuMDM2LS41MzkuMDIzLS44MDktLjA3LS44MzMtLjQ2My0xLjI1LTEuMjA0LTEuMjUtLjU5MS4wMTUtMS4xNzkuMDc3LTEuNzYuMTg1LS42OTQuMTE2LTEuMzIuMjU1LTEuODUyLjM5NGwtLjgzNCA5Ljg1NGgtNC4xNDRsMS4xMzUtMTQuMDg3aDMuMzhsLjM5MyAxLjA0MWExNy4xNjYgMTcuMTY2IDAgMCAxIDIuNzU2LS45MjZjLjQ4Ni0uMTE1Ljk0OS0uMjA4IDEuMzg5LS4zYTguMjg1IDguMjg1IDAgMCAxIDEuMjI3LS4xMTZjLjM4OC0uMDAyLjc3NS4wMjkgMS4xNTcuMDkyLjQxOS4wNjcuODIxLjIxNiAxLjE4MS40NC40MDEuMjYuNzI4LjYxOC45NSAxLjA0MS4yNjkuNjEzLjQxOCAxLjI3My40MzkgMS45NDN6bTE0LjE3LjAyM2ExLjcyIDEuNzIgMCAwIDEgMCAuNDg2YzAgLjE2Mi0uMDIzLjMwMS0uMDIzLjQxNmwtLjExNiAxLjEzNGEyLjcyNSAyLjcyNSAwIDAgMS0uMzM0IDEuMDk5IDIuNzMgMi43MyAwIDAgMS0uNzU0Ljg2NyA1LjI0IDUuMjQgMCAwIDEtMi4zMzkuOTk0Yy0uMzQxLjA4Mi0uNjkuMTI5LTEuMDQyLjEzOS0uNDM5LjA0Ny0uODc5LjA3LTEuMzY2LjA5My0uNDg2LjAyMy0uOTI2LjA0Ni0xLjMxOS4wNjktLjM5NC4wMjMtLjcxOC4wMjMtLjkwMy4wMjNsLS4wNDcuNjAyYy0uMDExLjEtLjAxMS4yMDEgMCAuM2wuMDI0LjE4NmMuMDE2LjI2Ni4xMjIuNTE5LjMwMS43MTcuMTg1LjIwOC41MDkuMzIzLjk3Mi4zMjMuNDYzIDAgMS4wMTktLjAyMyAxLjYyMS0uMDY5LjYwMi0uMDQ2IDEuMjA0LS4xMTYgMS44MjktLjE4NS41OS0uMDU3IDEuMTc3LS4xNDIgMS43NTktLjI1NC41LS4wODMuOTk0LS4xOTEgMS40ODItLjMyNGwtLjI1NSAzLjEyMmMtLjQ3NC4yMDItLjk2MS4zNzItMS40NTguNTA5LS41NzkuMTYyLTEuMTgxLjMwMS0xLjgwNi40NHMtMS4yNzMuMjMxLTEuOTIyLjMwMWMtLjU4NC4wNjktMS4xNzEuMTA4LTEuNzU5LjExNWExMS4zMjggMTEuMzI4IDAgMCAxLTEuMzg5LS4wOTIgNC40MyA0LjQzIDAgMCAxLTEuNTc1LS40ODYgMy42NjcgMy42NjcgMCAwIDEtMS4zMi0xLjE1N2MtLjM3LS41MDktLjYwMi0xLjIwMi0uNjcxLTIuMTI4LS4wMi0uMi0uMDI3LS40LS4wMjMtLjYwMSAwLS4yMDguMDIzLS40MTcuMDQ2LS42NDhsLjM0Ny00LjQ4N2E2Ljc1MiA2Ljc1MiAwIDAgMSAuMzcxLTEuODI4IDQuNiA0LjYgMCAwIDEgLjkwMy0xLjUyNiA0LjEyOSA0LjEyOSAwIDAgMSAxLjQ4Mi0xLjA2NSA1LjQzNiA1LjQzNiAwIDAgMSAyLjE1My0uMzkzaDIuOTg2YTUuMjc2IDUuMjc2IDAgMCAxIDIuMDg0LjM0N2MuNDYzLjE4OS44ODEuNDczIDEuMjI3LjgzMy4yODQuMjk1LjQ5OC42NTEuNjI1IDEuMDQxLjA5OC4zNTYuMTY3LjcyLjIwOSAxLjA4N3ptLTYuNTc2LjE2MmMtLjI4LjAxMy0uNTUyLjEwMS0uNzg3LjI1NGExLjA3NyAxLjA3NyAwIDAgMC0uNDg2Ljg3OWwtLjE2MiAxLjU1Yy4xMTYgMCAuMzI0IDAgLjY0OC0uMDIzYTguMjYzIDguMjYzIDAgMCAwIDEuMDQyLS4wNjljLjM3MS0uMDIzLjcxOC0uMDcgMS4wNDItLjA5My4yNDEtLjAxOC40OC0uMDQ5LjcxOC0uMDkyLjI4My0uMDM5LjU0OS0uMTU5Ljc2NC0uMzQ3LjEwOS0uMTIyLjE5Ni0uMjY0LjI1NC0uNDE3LjAzMy0uMTEzLjA1Ni0uMjI5LjA3LS4zNDcuMDE3LS4xMjIuMDI1LS4yNDYuMDIzLS4zN2ExLjAwMyAxLjAwMyAwIDAgMC0uMzAxLS42NzEuOTk0Ljk5NCAwIDAgMC0uNzQxLS4yNTRoLTIuMDg0eiIgZmlsbD0iI0NCQ0JDQiIvPjwvc3ZnPg==')
  }
  .__apr-wallet-link {
    display: flex;
    align-items: start;
    color: inherit;
    padding: 0;
    margin: 0 0 0.5rem 0;
  }
  .__apr-wallet-address {
    padding: 0;
    text-decoration: none;
    margin: 0 0.5rem;
    white-space: wrap;
    word-break: break-all;
    color: inherit;
  }
  .__apr-address-link {
    display: inline-block;
    width: 1.125rem;
    height: 1.125rem;
    padding: 0;
    margin: 0;
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18" height="18"%3E%3Cpath d="M40.96 4.98a2 2 0 0 0-.22.02H28a2 2 0 1 0 0 4h8.172L22.586 22.586a2 2 0 1 0 2.828 2.828L39 11.828V20a2 2 0 1 0 4 0V7.246a2 2 0 0 0-2.04-2.266zM12.5 8C8.383 8 5 11.383 5 15.5v20c0 4.117 3.383 7.5 7.5 7.5h20c4.117 0 7.5-3.383 7.5-7.5V26a2 2 0 1 0-4 0v9.5c0 1.947-1.553 3.5-3.5 3.5h-20A3.483 3.483 0 0 1 9 35.5v-20c0-1.947 1.553-3.5 3.5-3.5H22a2 2 0 1 0 0-4h-9.5z"/%3E%3C/svg%3E');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    flex-shrink: 0;
  }
  .__apr-copy-btn {
    width: 1.125rem;
    height: 1.125rem;
    padding: 0;
    margin: 0;
    background: none;
    background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 115.77 122.88" style="enable-background:new 0 0 115.77 122.88" xml:space="preserve"%3E%3Cpath d="M89.62 13.96v7.73h12.2v.02c3.85.01 7.34 1.57 9.86 4.1 2.5 2.51 4.06 5.98 4.07 9.82h.02v73.3h-.02c-.01 3.84-1.57 7.33-4.1 9.86-2.51 2.5-5.98 4.06-9.82 4.07v.02H40.1v-.02c-3.84-.01-7.34-1.57-9.86-4.1-2.5-2.51-4.06-5.98-4.07-9.82h-.02V92.51h-12.2v-.02c-3.84-.01-7.34-1.57-9.86-4.1-2.5-2.51-4.06-5.98-4.07-9.82H0V13.95h.02c.01-3.85 1.58-7.34 4.1-9.86C6.63 1.59 10.1.03 13.94.02V0H75.67v.02c3.85.01 7.34 1.57 9.86 4.1 2.5 2.51 4.06 5.98 4.07 9.82h.02v.02zm-10.58 7.73v-7.75h.02c0-.91-.39-1.75-1.01-2.37-.61-.61-1.46-1-2.37-1v.02H13.95v-.02c-.91 0-1.75.39-2.37 1.01-.61.61-1 1.46-1 2.37h.02v64.62h-.02c0 .91.39 1.75 1.01 2.37.61.61 1.46 1 2.37 1v-.02h12.2V35.64h.02c.01-3.85 1.58-7.34 4.1-9.86 2.51-2.5 5.98-4.06 9.82-4.07v-.02H79.04zm26.14 87.23V35.63h.02c0-.91-.39-1.75-1.01-2.37-.61-.61-1.46-1-2.37-1v.02H40.09v-.02c-.91 0-1.75.39-2.37 1.01-.61.61-1 1.46-1 2.37h.02v73.3h-.02c0 .91.39 1.75 1.01 2.37.61.61 1.46 1 2.37 1v-.02H101.83v.02c.91 0 1.75-.39 2.37-1.01.61-.61 1-1.46 1-2.37h-.02v-.01z" style="fill-rule:evenodd;clip-rule:evenodd"/%3E%3C/svg%3E');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    flex-shrink: 0;
    border: none;
    outline: none;
    cursor: pointer;
  }
  .__apr-copy-btn.animate {
    animation-name: copy_animate;
    animation-duration: 1.2s;
    animation-iteration-count: 1;
  }
  @keyframes copy_animate {
    5% {
      background-size: 80%;
      transform: rotate(5deg);
    }
    15% {
      transform: rotate(-30deg);
    }
    25% {
      background-size: 100%;
      transform: rotate(5deg);
    }
    35% {
      transform: rotate(-30deg);
      opacity: 1;
    }
    45% {
      background-size: 80%;
      transform: rotate(5deg);
      background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 115.77 122.88" style="enable-background:new 0 0 115.77 122.88" xml:space="preserve"%3E%3Cpath d="M89.62 13.96v7.73h12.2v.02c3.85.01 7.34 1.57 9.86 4.1 2.5 2.51 4.06 5.98 4.07 9.82h.02v73.3h-.02c-.01 3.84-1.57 7.33-4.1 9.86-2.51 2.5-5.98 4.06-9.82 4.07v.02H40.1v-.02c-3.84-.01-7.34-1.57-9.86-4.1-2.5-2.51-4.06-5.98-4.07-9.82h-.02V92.51h-12.2v-.02c-3.84-.01-7.34-1.57-9.86-4.1-2.5-2.51-4.06-5.98-4.07-9.82H0V13.95h.02c.01-3.85 1.58-7.34 4.1-9.86C6.63 1.59 10.1.03 13.94.02V0H75.67v.02c3.85.01 7.34 1.57 9.86 4.1 2.5 2.51 4.06 5.98 4.07 9.82h.02v.02zm-10.58 7.73v-7.75h.02c0-.91-.39-1.75-1.01-2.37-.61-.61-1.46-1-2.37-1v.02H13.95v-.02c-.91 0-1.75.39-2.37 1.01-.61.61-1 1.46-1 2.37h.02v64.62h-.02c0 .91.39 1.75 1.01 2.37.61.61 1.46 1 2.37 1v-.02h12.2V35.64h.02c.01-3.85 1.58-7.34 4.1-9.86 2.51-2.5 5.98-4.06 9.82-4.07v-.02H79.04zm26.14 87.23V35.63h.02c0-.91-.39-1.75-1.01-2.37-.61-.61-1.46-1-2.37-1v.02H40.09v-.02c-.91 0-1.75.39-2.37 1.01-.61.61-1 1.46-1 2.37h.02v73.3h-.02c0 .91.39 1.75 1.01 2.37.61.61 1.46 1 2.37 1v-.02H101.83v.02c.91 0 1.75-.39 2.37-1.01.61-.61 1-1.46 1-2.37h-.02v-.01z" style="fill-rule:evenodd;clip-rule:evenodd"/%3E%3C/svg%3E');
      opacity: 0;
    } 
    55% {
      transform: rotate(0deg);
      background-size: 40%;
      background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="68" height="46" fill="none"%3E%3Cpath d="m5 18.163 22.77 22.771L62.935 5.771" stroke="%235EAC24" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/%3E%3C/svg%3E');
      opacity: 1;
    }
    70% {
      background-size: 100%;
    }
    100% {
      background-image: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="68" height="46" fill="none"%3E%3Cpath d="m5 18.163 22.77 22.771L62.935 5.771" stroke="%235EAC24" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/%3E%3C/svg%3E');
    }
  }
  .__apr-conversion {
    display: flex;
    align-items: center;
    padding: 0;
    margin: 0 0 auto 0;
  }
  .__apr-conversion-icon {
    display: inline-block;
    width: 1.5rem; 
    height: 1.5rem;
    padding: 0;
    margin: 0;
    border-radius: 50%;
    background-size: 100%;
    background-position: center;
  }
  .__apr-conversion-result {
    padding: 0;
    margin: 0 0.5rem
  }
  .__apr-complete-page.active svg.active .svg-elem-1,
  .__apr-complete-page.active svg.active .svg-elem-2,
  .__apr-error-page.active svg.active .svg-elem-1,
  .__apr-error-page.active svg.active .svg-elem-2,
  .__apr-error-page.active svg.active .svg-elem-3 {
    stroke-dashoffset: 0;
  }
  .__apr-complete-page.active svg .svg-elem-1 {
    stroke-dashoffset: 404.1px;
    stroke-dasharray: 404.1px;
    -webkit-transition: stroke-dashoffset 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0s;
    transition: stroke-dashoffset 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0s;
  }
  .__apr-complete-page.active svg .svg-elem-2 {
    stroke-dashoffset: 83.9px;
    stroke-dasharray: 83.9px;
    -webkit-transition: stroke-dashoffset 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.12s;
    transition: stroke-dashoffset 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.12s;
  }
  .__apr-error-page.active svg .svg-elem-1 {
    stroke-dashoffset: 404.1px;
    stroke-dasharray: 404.1px;
    -webkit-transition: stroke-dashoffset 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0s;
    transition: stroke-dashoffset 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0s;
  }
  .__apr-error-page.active svg .svg-elem-2 {
    stroke-dashoffset: 59.9px;
    stroke-dasharray: 59.9px;
    -webkit-transition: stroke-dashoffset 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.12s;
    transition: stroke-dashoffset 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.12s;
  }
  .__apr-error-page.active svg .svg-elem-3 {
    stroke-dashoffset: 59.9px;
    stroke-dasharray: 59.9px;
    -webkit-transition: stroke-dashoffset 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.24s;
    transition: stroke-dashoffset 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.24s;
  }`;
  donateWidget.prepend(styles);
}


function formatName(name) {
  const arr = name.split(' ');

  if (arr.length > 1) {
    let newArr = [];

    arr.forEach(elem => {
      if (elem.indexOf('(') === -1) {
        newArr.push(elem);
      }
    });
    
    return newArr.join('-').toLowerCase();
  }

  return arr.toString().toLowerCase();
}


function formatAddress(address, isLink, prefix) {
  if (address.indexOf(':') !== -1 && !isLink) {
    return address.substring(address.indexOf(':') + 1);
  } else if (address.indexOf(':') !== -1 && isLink) {
    return address;
  } else if (address.indexOf(':') === -1 && isLink) {
    return `${prefix}:${address}`;
  } else {
    return address
  }
}