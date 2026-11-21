// VELVET HOUR — keyboard + mouse input. One job: turn browser events
// into per-frame queries (held keys, just-pressed edges, mouse position).

export function createInput(canvas) {
  const keys = new Set();
  const justPressed = new Set();
  const mouse = { x: -999, y: -999, inside: false };

  function onKeyDown(e) {
    const codes = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];
    if (codes.includes(e.code)) e.preventDefault();
    if (!e.repeat) justPressed.add(e.code);
    keys.add(e.code);
  }

  function onKeyUp(e) {
    keys.delete(e.code);
  }

  function onMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    mouse.y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    mouse.inside = true;
  }

  function onMouseLeave() {
    mouse.inside = false;
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);

  return {
    mouse,
    down(code) {
      return keys.has(code);
    },
    pressed(code) {
      return justPressed.has(code);
    },
    anyPressed() {
      return justPressed.size > 0;
    },
    // Call once per frame, after the game has read the edges.
    endFrame() {
      justPressed.clear();
    },
  };
}
