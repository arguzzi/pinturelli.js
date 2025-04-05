export default function steamPointer(_e, _s) {
  let response = {_e, _s};

  // not steam
  if (_e.type !== "pointermove") {
    response.exitCode = 0;
    return response;
  }

  return response;
}



