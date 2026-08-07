/* @ds-bundle: {"format":4,"namespace":"LIFTTailuxDesignSystem_19bb17","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"AvatarDot","sourcePath":"components/core/AvatarDot.jsx"},{"name":"Box","sourcePath":"components/core/Box.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"CopyButton","sourcePath":"components/core/CopyButton.jsx"},{"name":"Badge","sourcePath":"components/data-display/Badge.jsx"},{"name":"Circlebar","sourcePath":"components/data-display/Circlebar.jsx"},{"name":"GhostSpinner","sourcePath":"components/data-display/GhostSpinner.jsx"},{"name":"Progress","sourcePath":"components/data-display/Progress.jsx"},{"name":"Skeleton","sourcePath":"components/data-display/Skeleton.jsx"},{"name":"Spinner","sourcePath":"components/data-display/Spinner.jsx"},{"name":"Table","sourcePath":"components/data-display/Table.jsx"},{"name":"THead","sourcePath":"components/data-display/Table.jsx"},{"name":"TBody","sourcePath":"components/data-display/Table.jsx"},{"name":"TFoot","sourcePath":"components/data-display/Table.jsx"},{"name":"Tr","sourcePath":"components/data-display/Table.jsx"},{"name":"Th","sourcePath":"components/data-display/Table.jsx"},{"name":"Td","sourcePath":"components/data-display/Table.jsx"},{"name":"Tag","sourcePath":"components/data-display/Tag.jsx"},{"name":"Timeline","sourcePath":"components/data-display/Timeline.jsx"},{"name":"TimelineItem","sourcePath":"components/data-display/Timeline.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"InputErrorMsg","sourcePath":"components/forms/InputErrorMsg.jsx"},{"name":"Radio","sourcePath":"components/forms/Radio.jsx"},{"name":"Range","sourcePath":"components/forms/Range.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Swap","sourcePath":"components/forms/Swap.jsx"},{"name":"SwapOn","sourcePath":"components/forms/Swap.jsx"},{"name":"SwapOff","sourcePath":"components/forms/Swap.jsx"},{"name":"Switch","sourcePath":"components/forms/Switch.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"},{"name":"Upload","sourcePath":"components/forms/Upload.jsx"},{"name":"Accordion","sourcePath":"components/navigation/Accordion.jsx"},{"name":"AccordionItem","sourcePath":"components/navigation/Accordion.jsx"},{"name":"Collapse","sourcePath":"components/navigation/Collapse.jsx"},{"name":"Pagination","sourcePath":"components/navigation/Pagination.jsx"},{"name":"ScrollShadow","sourcePath":"components/navigation/ScrollShadow.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"44d9f5e2591a","components/core/AvatarDot.jsx":"1bc0831e0962","components/core/Box.jsx":"0471e3ab8e65","components/core/Button.jsx":"fe519f8003f9","components/core/Card.jsx":"875280251d63","components/core/CopyButton.jsx":"2841deaa7fd3","components/data-display/Badge.jsx":"815ad10a03e0","components/data-display/Circlebar.jsx":"0c861bd5ec59","components/data-display/GhostSpinner.jsx":"a7eee6e6b7b7","components/data-display/Progress.jsx":"fb18bd718955","components/data-display/Skeleton.jsx":"d4523b41b386","components/data-display/Spinner.jsx":"afeba9eb9224","components/data-display/Table.jsx":"1f8180615f98","components/data-display/Tag.jsx":"845b9e0dfd33","components/data-display/Timeline.jsx":"be62b5171f5a","components/forms/Checkbox.jsx":"5c388b5a6a08","components/forms/Input.jsx":"aecb5e838477","components/forms/InputErrorMsg.jsx":"f3d2fdc7b888","components/forms/Radio.jsx":"c8de9e124e83","components/forms/Range.jsx":"d6970c3dcc65","components/forms/Select.jsx":"a376f7164826","components/forms/Swap.jsx":"2fb684fb9075","components/forms/Switch.jsx":"60fce5f4affb","components/forms/Textarea.jsx":"ea9ba8644900","components/forms/Upload.jsx":"2118d592f8c9","components/navigation/Accordion.jsx":"b0c95556cf4b","components/navigation/Collapse.jsx":"0d30a22e19ab","components/navigation/Pagination.jsx":"c917b4eefba7","components/navigation/ScrollShadow.jsx":"6e7d2c3bd511","ui_kits/_shared/kit.jsx":"537ad25e28db","ui_kits/apps/ChatApp.jsx":"cb80c97cf08f","ui_kits/apps/KanbanBoard.jsx":"f9837696f1b8","ui_kits/auth/AuthScreens.jsx":"17e5eaa9d09c","ui_kits/dashboard/Chrome.jsx":"3217fbe0a5d9","ui_kits/dashboard/SalesDashboard.jsx":"8308023a9227"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LIFTTailuxDesignSystem_19bb17 = window.LIFTTailuxDesignSystem_19bb17 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
const AUTO_COLORS = ["primary", "secondary", "info", "success", "warning", "error"];
function colorFromText(text) {
  let sum = 0;
  for (let i = 0; i < text.length; i++) sum += text.charCodeAt(i);
  return AUTO_COLORS[sum % AUTO_COLORS.length];
}
function Avatar({
  component: Component = "div",
  src,
  srcSet,
  alt,
  name,
  size = 12,
  initialColor = "neutral",
  initialVariant = "filled",
  indicator,
  className,
  classNames = {},
  children,
  style,
  ...rest
}) {
  const chars = (name ? name.match(/\b(\w)/g) || [] : []).slice(0, 2).join("");
  const resolved = initialColor === "auto" ? colorFromText(chars) : initialColor;
  return /*#__PURE__*/React.createElement(Component, _extends({
    className: cx("avatar", className, classNames.root),
    "data-color": resolved,
    style: {
      height: size / 4 + "rem",
      width: size / 4 + "rem",
      ...style
    }
  }, rest), src || srcSet ? /*#__PURE__*/React.createElement("img", {
    className: cx("avatar-image avatar-display", classNames.display, classNames.image),
    src: src,
    srcSet: srcSet,
    alt: alt || name || "avatar",
    loading: "lazy"
  }) : /*#__PURE__*/React.createElement("div", {
    className: cx("avatar-initial avatar-display", initialVariant, resolved === "neutral" && "neutral", classNames.display, classNames.initial)
  }, name ? chars : children), indicator);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/AvatarDot.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function AvatarDot({
  color = "neutral",
  isPing = false,
  className,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-color": color,
    className: cx("avatar-dot", className),
    style: {
      backgroundColor: color === "neutral" ? "var(--color-gray-300)" : "var(--this)"
    }
  }, rest), isPing && /*#__PURE__*/React.createElement("span", {
    className: "animate-ping",
    style: {
      position: "absolute",
      inset: 0,
      display: "inline-flex",
      width: "100%",
      height: "100%",
      borderRadius: "9999px",
      backgroundColor: "inherit",
      opacity: 0.8
    }
  }), children);
}
Object.assign(__ds_scope, { AvatarDot });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/AvatarDot.jsx", error: String((e && e.message) || e) }); }

// components/core/Box.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Box({
  component: Component = "div",
  className,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(Component, _extends({
    className: cx("box", className),
    style: {
      position: "relative",
      overflowWrap: "break-word"
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Box });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Box.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Button({
  component: Component = "button",
  color = "neutral",
  variant = "filled",
  isIcon = false,
  isGlow = false,
  unstyled = false,
  disabled,
  className,
  children,
  type,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(Component, _extends({
    type: Component === "button" ? type || "button" : undefined,
    disabled: Component === "button" ? disabled : undefined,
    "data-disabled": disabled || undefined,
    "data-color": color,
    className: cx("btn-base", !unstyled && "btn", !unstyled && isIcon && "is-icon", !unstyled && "btn-" + variant, color === "neutral" && "btn-neutral", !unstyled && isGlow && "is-glow", className)
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Card({
  component: Component = "div",
  skin = "shadow",
  className,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(Component, _extends({
    className: cx("card", skin !== "none" && "skin-" + skin, className)
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/CopyButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CopyButton({
  value,
  timeout = 1200,
  children,
  ...rest
}) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), timeout);
  };
  if (typeof children === "function") return children({
    copied,
    copy
  });
  return /*#__PURE__*/React.createElement(__ds_scope.Button, _extends({
    variant: "flat",
    isIcon: true,
    className: "size-8 rounded-full",
    onClick: copy
  }, rest), copied ? "\u2713" : "\u29C9");
}
Object.assign(__ds_scope, { CopyButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/CopyButton.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Badge({
  component: Component = "div",
  variant = "filled",
  color = "neutral",
  isGlow = false,
  unstyled = false,
  className,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(Component, _extends({
    "data-color": color === "neutral" ? undefined : color,
    className: cx("badge-base", !unstyled && "badge", !unstyled && "badge-" + variant, !unstyled && color === "neutral" && "badge-neutral", !unstyled && isGlow && "is-glow", className)
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Circlebar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Circlebar({
  value = 0,
  isIndeterminate = false,
  strokeWidth = 6,
  strokeLinecap = "round",
  size = 24,
  showRail = true,
  color = "neutral",
  className,
  classNames = {},
  children,
  ...rest
}) {
  const box = 100 + strokeWidth;
  const r = 50;
  const c = 2 * Math.PI * r;
  const stroke = color === "neutral" ? "var(--color-gray-500)" : "var(--this)";
  return /*#__PURE__*/React.createElement("div", {
    className: cx(classNames.root),
    "data-color": color === "neutral" ? undefined : color,
    style: {
      maxWidth: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: cx("circlebar-wrapper", classNames.wrapper),
    style: {
      position: "relative",
      display: "inline-block",
      width: size / 4 + "rem",
      height: size / 4 + "rem"
    }
  }, /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 " + box + " " + box,
    className: cx("circlebar-svg", isIndeterminate && "animate-spin", className, classNames.svg),
    style: {
      width: "100%",
      height: "100%",
      transform: "rotate(-90deg)"
    }
  }, rest), showRail && /*#__PURE__*/React.createElement("circle", {
    cx: box / 2,
    cy: box / 2,
    r: r,
    fill: "none",
    strokeWidth: strokeWidth,
    stroke: "var(--color-gray-150)"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: box / 2,
    cy: box / 2,
    r: r,
    fill: "none",
    strokeWidth: strokeWidth,
    strokeLinecap: strokeLinecap,
    stroke: stroke,
    strokeDasharray: c,
    strokeDashoffset: isIndeterminate ? c * 0.75 : c * (1 - Math.min(Math.max(value, 0), 100) / 100),
    style: {
      transition: "stroke-dashoffset 200ms var(--ease-out)"
    }
  })), React.Children.count(children) > 0 && /*#__PURE__*/React.createElement("div", {
    className: classNames.content,
    style: {
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, children)));
}
Object.assign(__ds_scope, { Circlebar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Circlebar.jsx", error: String((e && e.message) || e) }); }

// components/data-display/GhostSpinner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function GhostSpinner({
  variant = "default",
  animate = true,
  isElastic = false,
  className,
  ...rest
}) {
  const base = {
    borderStyle: "solid",
    borderWidth: 3,
    borderRadius: "9999px"
  };
  const style = variant === "soft" ? {
    ...base,
    borderColor: "rgb(255 255 255 / 0.3)",
    borderRightColor: "#fff"
  } : {
    ...base,
    borderColor: "#fff",
    borderRightColor: "transparent"
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cx("spinner-base ghost-spinner", isElastic && "is-elastic", animate && "animate-spin", className),
    style: style
  }, rest));
}
Object.assign(__ds_scope, { GhostSpinner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/GhostSpinner.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Progress.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Progress({
  value = 0,
  showRail = true,
  isActive = false,
  isIndeterminate = false,
  color = "neutral",
  variant = "default",
  unstyled = false,
  animationDuration,
  className,
  classNames = {},
  style = {},
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", {
    "data-color": color === "neutral" ? undefined : color,
    className: cx("progress-rail", !showRail && "is-railless", className, classNames.root),
    style: {
      backgroundColor: !showRail ? "transparent" : variant === "soft" && color !== "neutral" ? "color-mix(in srgb, var(--this) 15%, transparent)" : undefined
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    className: cx("progress", color === "neutral" && "is-neutral", isActive && "is-active", isIndeterminate && "is-indeterminate", classNames.bar),
    style: {
      width: isIndeterminate ? "100%" : value + "%",
      animationDuration,
      ...style
    }
  }, rest), children));
}
Object.assign(__ds_scope, { Progress });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Progress.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Skeleton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Skeleton({
  animate = true,
  className,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cx("skeleton", animate && "animate-wave", className),
    style: style
  }, rest));
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Spinner.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Spinner({
  animate = true,
  isElastic = false,
  disabled = false,
  variant = "default",
  color = "neutral",
  unstyled = false,
  className,
  ...rest
}) {
  const common = cx("spinner-base", isElastic && "is-elastic", animate && !disabled && "animate-spin", className);
  const dataColor = color === "neutral" ? undefined : color;
  if (variant === "innerDot") {
    return /*#__PURE__*/React.createElement("div", _extends({
      "data-color": dataColor,
      className: common,
      style: {
        color: color === "neutral" ? "var(--color-gray-500)" : "var(--this)",
        opacity: disabled ? 0.5 : 1
      }
    }, rest), /*#__PURE__*/React.createElement("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      viewBox: "0 0 28 28",
      style: {
        width: "100%",
        height: "100%"
      }
    }, /*#__PURE__*/React.createElement("path", {
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M28 14c0 7.732-6.268 14-14 14S0 21.732 0 14 6.268 0 14 0s14 6.268 14 14zm-2.764.005c0 6.185-5.014 11.2-11.2 11.2-6.185 0-11.2-5.015-11.2-11.2 0-6.186 5.015-11.2 11.2-11.2 6.186 0 11.2 5.014 11.2 11.2zM8.4 16.8a2.8 2.8 0 100-5.6 2.8 2.8 0 000 5.6z"
    })));
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-color": dataColor,
    className: cx(common, !unstyled && "spinner", !unstyled && color === "neutral" && "is-neutral", !unstyled && variant === "soft" && "soft"),
    style: {
      opacity: disabled ? 0.5 : 1
    }
  }, rest));
}
Object.assign(__ds_scope, { Spinner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Spinner.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Table.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Table({
  component: Component = "table",
  hoverable,
  zebra,
  dense,
  sticky,
  className,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(Component, _extends({
    className: cx("table", hoverable && "is-hoverable", zebra && "is-zebra", dense && "is-dense", sticky && "is-sticky", className)
  }, rest), children);
}
function tag(el, cls) {
  return function TableTag({
    component: Component = el,
    className,
    children,
    ...rest
  }) {
    return /*#__PURE__*/React.createElement(Component, _extends({
      className: cx(cls, className)
    }, rest), children);
  };
}
const THead = tag("thead", "table-thead");
const TBody = tag("tbody", "table-tbody");
const TFoot = tag("tfoot", "table-tfoot");
const Tr = tag("tr", "table-tr");
const Th = tag("th", "table-th");
const Td = tag("td", "table-td");
Object.assign(__ds_scope, { Table, THead, TBody, TFoot, Tr, Th, Td });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Table.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Tag({
  component: Component = "a",
  variant = "filled",
  color = "neutral",
  isGlow = false,
  unstyled = false,
  className,
  children,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(Component, _extends({
    "data-color": color === "neutral" ? undefined : color,
    className: cx("tag-base", !unstyled && "tag", !unstyled && "tag-" + variant, !unstyled && color === "neutral" && "tag-neutral", !unstyled && isGlow && "is-glow", className)
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Tag.jsx", error: String((e && e.message) || e) }); }

// components/data-display/Timeline.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
const TimelineContext = React.createContext({
  variant: "filled"
});
function Timeline({
  variant = "filled",
  lineSpace = false,
  pointSize,
  lineWidth,
  className,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(TimelineContext.Provider, {
    value: {
      variant
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    className: cx("timeline", lineSpace && "line-space", className),
    style: {
      "--timeline-point-size": pointSize,
      "--timeline-line-width": lineWidth,
      ...style
    }
  }, rest), children));
}
function TimelineItem({
  title,
  time,
  point,
  color = "neutral",
  variant,
  isPing = false,
  className,
  classNames = {},
  children,
  ...rest
}) {
  const ctx = React.useContext(TimelineContext);
  const merged = variant || ctx.variant;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cx("timeline-item", className, classNames.root),
    "data-color": color === "neutral" ? undefined : color
  }, rest), point || /*#__PURE__*/React.createElement("div", {
    className: cx("timeline-item-point", color !== "neutral" && merged, classNames.point)
  }, isPing && /*#__PURE__*/React.createElement("span", {
    className: "animate-ping",
    style: {
      display: "inline-flex",
      width: "100%",
      height: "100%",
      borderRadius: "9999px",
      backgroundColor: "inherit",
      opacity: 0.8
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: cx("timeline-item-content-wrappper", classNames.contentWrapper)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      paddingBottom: "0.375rem"
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    className: cx("t-body", classNames.title),
    style: {
      fontWeight: 500,
      lineHeight: 1,
      paddingBottom: "0.375rem",
      color: "var(--text-muted)"
    }
  }, title), time && /*#__PURE__*/React.createElement("span", {
    className: cx("t-caption", classNames.time)
  }, time)), /*#__PURE__*/React.createElement("div", {
    className: cx("timeline-item-content", classNames.content),
    style: {
      paddingTop: "0.25rem",
      paddingBottom: "0.25rem"
    }
  }, children)));
}
Object.assign(__ds_scope, { Timeline, TimelineItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data-display/Timeline.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Checkbox({
  variant = "basic",
  color = "primary",
  unstyled = false,
  label,
  disabled,
  indeterminate,
  className,
  classNames = {},
  labelProps,
  ...rest
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = Boolean(indeterminate);
  }, [indeterminate]);
  const input = /*#__PURE__*/React.createElement("input", _extends({
    ref: ref,
    type: "checkbox",
    disabled: disabled,
    "data-color": color,
    className: cx("form-checkbox", !unstyled && variant, className, classNames.input)
  }, rest));
  if (!label) return input;
  return /*#__PURE__*/React.createElement("label", _extends({
    className: cx("input-label", classNames.label),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      cursor: disabled ? "not-allowed" : "pointer"
    }
  }, labelProps), input, /*#__PURE__*/React.createElement("span", {
    className: classNames.labelText
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Input({
  component: Component = "input",
  label,
  prefix,
  suffix,
  description,
  error,
  unstyled = false,
  disabled,
  type = "text",
  className,
  classNames = {},
  rootProps,
  labelProps,
  id,
  ...rest
}) {
  const generated = React.useId();
  const inputId = id || generated;
  const isTextarea = Component === "textarea";
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cx("input-root", classNames.root)
  }, rootProps), label && /*#__PURE__*/React.createElement("label", _extends({
    htmlFor: inputId,
    className: cx("input-label", classNames.label)
  }, labelProps), /*#__PURE__*/React.createElement("span", {
    className: classNames.labelText
  }, label)), /*#__PURE__*/React.createElement("div", {
    className: cx("input-wrapper", "relative", classNames.wrapper),
    style: {
      position: "relative",
      marginTop: label ? "0.375rem" : undefined
    }
  }, /*#__PURE__*/React.createElement(Component, _extends({
    id: inputId,
    type: type,
    disabled: disabled,
    className: cx(isTextarea ? "form-textarea-base" : "form-input-base", !unstyled && (isTextarea ? "form-textarea" : "form-input"), prefix && "has-prefix", suffix && "has-suffix", error && "is-error", className, classNames.input)
  }, rest)), prefix && /*#__PURE__*/React.createElement("div", {
    className: cx("field-affix", "prefix", classNames.prefix)
  }, prefix), suffix && /*#__PURE__*/React.createElement("div", {
    className: cx("field-affix", "suffix", classNames.suffix)
  }, suffix)), error && typeof error !== "boolean" && /*#__PURE__*/React.createElement("span", {
    className: cx("input-error", classNames.error)
  }, error), description && /*#__PURE__*/React.createElement("span", {
    className: cx("input-description", classNames.description)
  }, description));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/InputErrorMsg.jsx
try { (() => {
const cx = (...a) => a.filter(Boolean).join(" ");
function InputErrorMsg({
  when = true,
  className,
  children
}) {
  if (!when || !children) return null;
  return /*#__PURE__*/React.createElement("span", {
    className: cx("input-error", className)
  }, children);
}
Object.assign(__ds_scope, { InputErrorMsg });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/InputErrorMsg.jsx", error: String((e && e.message) || e) }); }

// components/forms/Radio.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Radio({
  variant = "basic",
  color = "primary",
  unstyled = false,
  label,
  disabled,
  className,
  classNames = {},
  labelProps,
  ...rest
}) {
  const input = /*#__PURE__*/React.createElement("input", _extends({
    type: "radio",
    disabled: disabled,
    "data-color": color,
    className: cx("form-radio", !unstyled && variant, className, classNames.input)
  }, rest));
  if (!label) return input;
  return /*#__PURE__*/React.createElement("label", _extends({
    className: cx("input-label", classNames.label),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      cursor: disabled ? "not-allowed" : "pointer"
    }
  }, labelProps), input, /*#__PURE__*/React.createElement("span", {
    className: classNames.labelText
  }, label));
}
Object.assign(__ds_scope, { Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Radio.jsx", error: String((e && e.message) || e) }); }

// components/forms/Range.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Range({
  color = "neutral",
  thumbSize,
  trackSize,
  className,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("input", _extends({
    type: "range",
    "data-color": color,
    className: cx("form-range", className),
    style: {
      "--thumb-size": thumbSize,
      "--track-h": trackSize,
      color: color === "neutral" ? undefined : "var(--this)",
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Range });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Range.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
const CHEVRON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E";
function Select({
  label,
  description,
  error,
  data = [],
  disabled,
  className,
  classNames = {},
  rootProps,
  id,
  children,
  ...rest
}) {
  const generated = React.useId();
  const selectId = id || generated;
  const options = data.map(item => typeof item === "object" ? item : {
    label: item,
    value: item
  });
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cx("input-root", classNames.root)
  }, rootProps), label && /*#__PURE__*/React.createElement("label", {
    htmlFor: selectId,
    className: cx("input-label", classNames.label)
  }, /*#__PURE__*/React.createElement("span", {
    className: classNames.labelText
  }, label)), /*#__PURE__*/React.createElement("div", {
    className: cx("input-wrapper", classNames.wrapper),
    style: {
      position: "relative",
      marginTop: label ? "0.375rem" : undefined
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selectId,
    disabled: disabled,
    className: cx("form-select-base", "form-select", "has-suffix", error && "is-error", className, classNames.select),
    style: {
      backgroundImage: "url(\"" + CHEVRON + "\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 0.65rem center",
      backgroundSize: "1.1rem"
    }
  }, rest), children || options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value,
    disabled: o.disabled
  }, o.label)))), error && typeof error !== "boolean" && /*#__PURE__*/React.createElement("span", {
    className: "input-error"
  }, error), description && /*#__PURE__*/React.createElement("span", {
    className: "input-description"
  }, description));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Swap.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Swap({
  component: Component = "div",
  value,
  defaultValue = "on",
  onChange,
  effect = "fade",
  disabled,
  className,
  children,
  onClick,
  ...rest
}) {
  const [internal, setInternal] = React.useState(defaultValue);
  const current = value !== undefined ? value : internal;
  const handleClick = e => {
    if (!disabled) {
      const next = current === "on" ? "off" : "on";
      if (value === undefined) setInternal(next);
      onChange && onChange(next);
    }
    onClick && onClick(e);
  };
  return /*#__PURE__*/React.createElement(Component, _extends({
    "data-swap-value": current,
    "data-swap-effect": effect,
    "data-disabled": disabled || undefined,
    className: cx("swap", className),
    style: {
      position: "relative",
      display: "inline-grid",
      placeContent: "center",
      userSelect: "none",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1
    },
    onClick: handleClick
  }, rest), children);
}
function face(kind) {
  return function SwapFace({
    children,
    className,
    ...rest
  }) {
    return /*#__PURE__*/React.createElement("span", _extends({
      "data-swap-face": kind,
      className: cx("swap-" + kind, className),
      style: {
        gridArea: "1 / 1",
        display: "inline-flex",
        transition: "opacity 200ms var(--ease-in-out), transform 200ms var(--ease-in-out)"
      }
    }, rest), children);
  };
}
const SwapOn = face("on");
const SwapOff = face("off");
Object.assign(__ds_scope, { Swap, SwapOn, SwapOff });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Swap.jsx", error: String((e && e.message) || e) }); }

// components/forms/Switch.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function Switch({
  variant = "basic",
  color = "primary",
  unstyled = false,
  label,
  disabled,
  className,
  classNames = {},
  labelProps,
  ...rest
}) {
  const input = /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    role: "switch",
    disabled: disabled,
    "data-color": color,
    className: cx("form-switch", !unstyled && variant === "outlined" && "is-outline", className, classNames.input)
  }, rest));
  if (!label) return input;
  return /*#__PURE__*/React.createElement("label", _extends({
    className: cx("input-label", classNames.label),
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      cursor: disabled ? "not-allowed" : "pointer"
    }
  }, labelProps), input, /*#__PURE__*/React.createElement("span", {
    className: classNames.labelText
  }, label));
}
Object.assign(__ds_scope, { Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Switch.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Textarea({
  rows = 4,
  ...rest
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Input, _extends({
    component: "textarea",
    rows: rows,
    type: undefined
  }, rest));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/forms/Upload.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Upload({
  onChange = () => {},
  children,
  accept,
  multiple,
  disabled,
  name,
  inputProps = {},
  ...rest
}) {
  const inputRef = React.useRef(null);
  const onClick = () => {
    if (!disabled && inputRef.current) inputRef.current.click();
  };
  const handleChange = e => {
    const files = e.currentTarget.files;
    if (files) onChange(Array.from(files));
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, children({
    onClick,
    disabled,
    ...rest
  }), /*#__PURE__*/React.createElement("input", _extends({
    hidden: true,
    type: "file",
    ref: inputRef,
    accept: accept,
    multiple: multiple,
    name: name,
    disabled: disabled,
    onChange: handleChange
  }, inputProps)));
}
Object.assign(__ds_scope, { Upload });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Upload.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Accordion.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
const AccordionContext = React.createContext(null);
function Accordion({
  multiple = false,
  defaultValue = [],
  className,
  children,
  ...rest
}) {
  const [open, setOpen] = React.useState(Array.isArray(defaultValue) ? defaultValue : [defaultValue]);
  const toggle = id => setOpen(prev => prev.includes(id) ? prev.filter(v => v !== id) : multiple ? [...prev, id] : [id]);
  return /*#__PURE__*/React.createElement(AccordionContext.Provider, {
    value: {
      open,
      toggle
    }
  }, /*#__PURE__*/React.createElement("div", _extends({
    className: cx("accordion", className)
  }, rest), children));
}
function AccordionItem({
  value,
  title,
  className,
  children,
  ...rest
}) {
  const ctx = React.useContext(AccordionContext);
  const isOpen = ctx ? ctx.open.includes(value) : false;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cx("accordion-item", className),
    "data-open": isOpen || undefined
  }, rest), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "accordion-button",
    "aria-expanded": isOpen,
    onClick: () => ctx && ctx.toggle(value)
  }, /*#__PURE__*/React.createElement("span", null, title), /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 20 20",
    fill: "currentColor",
    style: {
      width: "1.125rem",
      height: "1.125rem",
      flexShrink: 0,
      transition: "transform 200ms var(--ease-in-out)",
      transform: isOpen ? "rotate(180deg)" : "none"
    }
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
  }))), /*#__PURE__*/React.createElement("div", {
    className: "accordion-panel",
    style: {
      height: isOpen ? "auto" : 0
    }
  }, isOpen && /*#__PURE__*/React.createElement("div", {
    className: "accordion-panel-inner"
  }, children)));
}
Object.assign(__ds_scope, { Accordion, AccordionItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Accordion.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Collapse.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Collapse({
  component: Component = "div",
  in: opened,
  transitionDuration = 250,
  transitionTimingFunction = "var(--ease-in-out)",
  min = "0px",
  className,
  children,
  style,
  ...rest
}) {
  const ref = React.useRef(null);
  const [height, setHeight] = React.useState(opened ? "auto" : min);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (transitionDuration === 0) {
      setHeight(opened ? "auto" : min);
      return;
    }
    setHeight(opened ? el.scrollHeight + "px" : min);
  }, [opened, min, transitionDuration, children]);
  if (transitionDuration === 0 && !opened) return null;
  return /*#__PURE__*/React.createElement(Component, _extends({
    className: className,
    style: {
      height,
      overflow: "hidden",
      transition: "height " + transitionDuration + "ms " + transitionTimingFunction,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      display: "flow-root"
    }
  }, children));
}
Object.assign(__ds_scope, { Collapse });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Collapse.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Pagination.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function range(total, page, siblings) {
  const items = [];
  const push = v => items.push(v);
  const left = Math.max(2, page - siblings);
  const right = Math.min(total - 1, page + siblings);
  push(1);
  if (left > 2) push("dots-l");
  for (let i = left; i <= right; i++) push(i);
  if (right < total - 1) push("dots-r");
  if (total > 1) push(total);
  return items;
}
function Chevron({
  dir
}) {
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 20 20",
    fill: "currentColor",
    className: "pagination-icon",
    style: {
      transform: dir === "left" ? "rotate(90deg)" : "rotate(-90deg)"
    }
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
  }));
}
function Pagination({
  total = 1,
  page,
  defaultPage = 1,
  onChange,
  siblings = 1,
  color = "primary",
  withEdges = false,
  className,
  ...rest
}) {
  const [internal, setInternal] = React.useState(defaultPage);
  const current = page !== undefined ? page : internal;
  const go = p => {
    const next = Math.min(Math.max(p, 1), total);
    if (page === undefined) setInternal(next);
    onChange && onChange(next);
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cx("pagination", className),
    "data-color": color
  }, rest), withEdges && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "pagination-control pagination-control-icon",
    disabled: current === 1,
    onClick: () => go(1),
    "aria-label": "First page"
  }, "\xAB"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "pagination-control pagination-control-icon",
    disabled: current === 1,
    onClick: () => go(current - 1),
    "aria-label": "Previous page"
  }, /*#__PURE__*/React.createElement(Chevron, {
    dir: "left"
  })), range(total, current, siblings).map((item, i) => typeof item === "number" ? /*#__PURE__*/React.createElement("button", {
    key: i,
    type: "button",
    className: cx("pagination-control", item === current && "is-active"),
    onClick: () => go(item)
  }, item) : /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "pagination-control",
    style: {
      pointerEvents: "none"
    }
  }, "\u2026")), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "pagination-control pagination-control-icon",
    disabled: current === total,
    onClick: () => go(current + 1),
    "aria-label": "Next page"
  }, /*#__PURE__*/React.createElement(Chevron, {
    dir: "right"
  })), withEdges && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "pagination-control pagination-control-icon",
    disabled: current === total,
    onClick: () => go(total),
    "aria-label": "Last page"
  }, "\xBB"));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/navigation/ScrollShadow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const cx = (...a) => a.filter(Boolean).join(" ");
function ScrollShadow({
  orientation = "vertical",
  size = "2.5rem",
  className,
  children,
  style,
  ...rest
}) {
  const ref = React.useRef(null);
  const [state, setState] = React.useState({
    start: false,
    end: false
  });
  const update = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (orientation === "vertical") {
      setState({
        start: el.scrollTop > 1,
        end: el.scrollTop + el.clientHeight < el.scrollHeight - 1
      });
    } else {
      setState({
        start: el.scrollLeft > 1,
        end: el.scrollLeft + el.clientWidth < el.scrollWidth - 1
      });
    }
  }, [orientation]);
  React.useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    el.addEventListener("scroll", update);
    return () => el.removeEventListener("scroll", update);
  }, [update]);
  const attrs = {};
  if (orientation === "vertical") {
    if (state.start && state.end) attrs["data-top-bottom-scroll"] = "true";else if (state.start) attrs["data-top-scroll"] = "true";else if (state.end) attrs["data-bottom-scroll"] = "true";
  } else {
    if (state.start && state.end) attrs["data-left-right-scroll"] = "true";else if (state.start) attrs["data-left-scroll"] = "true";else if (state.end) attrs["data-right-scroll"] = "true";
  }
  return /*#__PURE__*/React.createElement("div", _extends({
    ref: ref,
    className: cx("scroll-shadow", "custom-scrollbar", className),
    style: {
      "--scroll-shadow-size": size,
      overflow: orientation === "vertical" ? "hidden auto" : "auto hidden",
      ...style
    }
  }, attrs, rest), children);
}
Object.assign(__ds_scope, { ScrollShadow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/ScrollShadow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/_shared/kit.jsx
try { (() => {
/* Shared helpers for the UI kits. No exports — these attach to window so the
   design-system compiler leaves them alone and the kits can load them with a
   plain <script type="text/babel" src="…"> tag. */

const HERO = (name, kind) => "https://unpkg.com/heroicons@2.2.0/" + (kind === "solid" ? "20/solid/" : "24/outline/") + name + ".svg";
function Icon({
  src,
  className,
  style,
  size
}) {
  const [html, setHtml] = React.useState("");
  React.useEffect(() => {
    let alive = true;
    fetch(src).then(r => r.ok ? r.text() : "").then(t => {
      if (!alive || !t) return;
      setHtml(t.replace(/<svg([^>]*)>/, (m, a) => "<svg" + a.replace(/\s(width|height)="[^"]*"/g, "") + ' width="100%" height="100%">'));
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, [src]);
  const px = size ? size + "rem" : undefined;
  return /*#__PURE__*/React.createElement("span", {
    className: className,
    style: {
      display: "inline-block",
      flexShrink: 0,
      lineHeight: 0,
      width: px,
      height: px,
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: html
    }
  });
}
function Chart({
  options,
  height,
  className
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!ref.current || typeof ApexCharts === "undefined") return;
    const c = new ApexCharts(ref.current, {
      ...options,
      chart: {
        ...(options.chart || {}),
        height,
        fontFamily: "Inter, sans-serif"
      }
    });
    c.render();
    return () => c.destroy();
  }, []);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: className,
    style: {
      minHeight: height
    }
  });
}
Object.assign(window, {
  HERO,
  Icon,
  Chart
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/_shared/kit.jsx", error: String((e && e.message) || e) }); }

// ui_kits/apps/ChatApp.jsx
try { (() => {
const {
  Avatar,
  AvatarDot,
  Badge,
  Button,
  Card,
  Input,
  ScrollShadow
} = window.LIFTTailuxDesignSystem_19bb17 || {};
const A = n => "../../assets/avatars/avatar-" + n + ".jpg";
const CHATS = [{
  id: "1",
  name: "Konnor Guzman",
  avatar: A(2),
  online: true,
  time: "14:02",
  unread: 2,
  last: "Sounds good — I'll push the branch tonight.",
  role: "Frontend Developer"
}, {
  id: "2",
  name: "Ella Bell",
  avatar: A(4),
  online: true,
  time: "13:40",
  unread: 0,
  last: "The invoice is settled, thanks!",
  role: "Finance Lead"
}, {
  id: "3",
  name: "Derrick Simmons",
  avatar: A(6),
  online: false,
  time: "Tue",
  unread: 0,
  last: "Can you review the Figma before Friday?",
  role: "Product Designer"
}, {
  id: "4",
  name: "Katrina West",
  avatar: A(3),
  online: false,
  time: "Mon",
  unread: 0,
  last: "Shipped 🙂",
  role: "Partner Lead"
}, {
  id: "5",
  name: "Henry Curtis",
  avatar: null,
  online: true,
  time: "Mar 18",
  unread: 0,
  last: "Let's sync on the Q2 numbers.",
  role: "Field Sales"
}];
const SEED = {
  "1": [{
    me: false,
    text: "Morning — did the analytics build go out?",
    t: "2 hours ago"
  }, {
    me: true,
    text: "It did. Sales, Orders and CRM are all on v1.3.4 now.",
    t: "2 hours ago"
  }, {
    me: true,
    text: "Only thing left is the customiser drawer.",
    t: "2 hours ago"
  }, {
    me: false,
    text: "Sounds good — I'll push the branch tonight.",
    t: "an hour ago"
  }],
  "2": [{
    me: false,
    text: "The invoice is settled, thanks!",
    t: "an hour ago"
  }],
  "3": [{
    me: false,
    text: "Can you review the Figma before Friday?",
    t: "2 days ago"
  }],
  "4": [{
    me: false,
    text: "Shipped 🙂",
    t: "3 days ago"
  }],
  "5": [{
    me: false,
    text: "Let's sync on the Q2 numbers.",
    t: "a week ago"
  }]
};
function ChatListItem({
  chat,
  active,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    className: "btn-base",
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.625rem",
      width: "100%",
      padding: "0.625rem 0.75rem",
      border: "none",
      cursor: "pointer",
      textAlign: "left",
      transition: "background 200ms var(--ease-in-out)",
      background: active ? "var(--color-primary-600)" : "transparent",
      color: active ? "#fff" : "inherit"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    size: 10,
    src: chat.avatar,
    name: chat.name,
    initialColor: "auto",
    indicator: chat.online ? /*#__PURE__*/React.createElement(AvatarDot, {
      color: "success",
      style: {
        bottom: 0,
        right: 0
      }
    }) : null
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-medium truncate",
    style: {
      color: active ? "#fff" : "var(--text-heading)"
    }
  }, chat.name), /*#__PURE__*/React.createElement("span", {
    className: "text-tiny-plus",
    style: {
      color: active ? "rgb(255 255 255 / .8)" : "var(--text-subtle)",
      flexShrink: 0
    }
  }, chat.time)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      gap: "0.5rem",
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs truncate",
    style: {
      color: active ? "rgb(255 255 255 / .8)" : "var(--text-subtle)"
    }
  }, chat.last), chat.unread > 0 && !active && /*#__PURE__*/React.createElement(Badge, {
    color: "primary",
    className: "text-tiny-plus rounded-full",
    style: {
      height: "1rem",
      minWidth: "1rem",
      padding: "0 0.25rem"
    }
  }, chat.unread))));
}
function Bubble({
  m,
  profile
}) {
  if (m.me) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "flex-end",
        gap: "0.625rem",
        marginLeft: "2.5rem",
        marginBottom: "1rem"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        maxWidth: "32rem",
        borderRadius: "1rem",
        padding: "0.75rem",
        background: "var(--color-primary-500)",
        color: "#fff"
      }
    }, /*#__PURE__*/React.createElement("span", null, m.text), /*#__PURE__*/React.createElement("p", {
      className: "text-tiny-plus",
      style: {
        marginTop: "0.25rem",
        marginBottom: "-0.5rem",
        color: "rgb(255 255 255 / .9)"
      }
    }, m.t)), /*#__PURE__*/React.createElement(Avatar, {
      size: 10,
      src: A(12),
      name: "Travis Fuller"
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      gap: "0.625rem",
      marginRight: "2.5rem",
      marginBottom: "1rem"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    size: 10,
    src: profile.avatar,
    name: profile.name,
    initialColor: "auto"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "32rem",
      borderRadius: "1rem",
      padding: "0.75rem",
      background: "var(--color-gray-150)"
    }
  }, /*#__PURE__*/React.createElement("div", null, m.text), /*#__PURE__*/React.createElement("p", {
    className: "text-tiny-plus",
    style: {
      marginTop: "0.25rem",
      marginBottom: "-0.375rem",
      textAlign: "right",
      color: "var(--color-gray-400)"
    }
  }, m.t)));
}
function ChatApp() {
  const [activeId, setActiveId] = React.useState("1");
  const [threads, setThreads] = React.useState(SEED);
  const [draft, setDraft] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [showProfile, setShowProfile] = React.useState(true);
  const chat = CHATS.find(c => c.id === activeId);
  const list = CHATS.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  const endRef = React.useRef(null);
  React.useEffect(() => {
    if (endRef.current) endRef.current.parentNode.scrollTop = endRef.current.parentNode.scrollHeight;
  }, [threads, activeId]);
  const send = e => {
    e.preventDefault();
    if (!draft.trim()) return;
    setThreads(t => ({
      ...t,
      [activeId]: [...t[activeId], {
        me: true,
        text: draft.trim(),
        t: "just now"
      }]
    }));
    setDraft("");
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      height: "100%",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 300,
      flexShrink: 0,
      background: "var(--surface-card)",
      borderRight: "1px solid var(--color-gray-150)",
      display: "flex",
      flexDirection: "column",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1rem 0.75rem 0"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-base font-medium",
    style: {
      color: "var(--text-heading)"
    }
  }, "Chat"), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-8 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("pencil-square"),
    size: 1.125
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "0.375rem",
      padding: "0.75rem 0.75rem 0"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      left: 8,
      top: 0,
      height: 32,
      display: "flex",
      alignItems: "center",
      color: "var(--color-gray-400)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("magnifying-glass"),
    size: 1
  })), /*#__PURE__*/React.createElement("input", {
    value: query,
    onChange: e => setQuery(e.target.value),
    placeholder: "Search here...",
    className: "text-xs-plus",
    style: {
      width: "100%",
      height: 32,
      borderRadius: "var(--radius-md)",
      border: "none",
      background: "var(--color-gray-150)",
      padding: "0 0.5rem 0 2rem",
      outline: "none",
      fontFamily: "inherit"
    }
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-8 rounded-lg"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("adjustments-horizontal"),
    size: 1.25
  }))), /*#__PURE__*/React.createElement(ScrollShadow, {
    className: "hide-scrollbar",
    style: {
      marginTop: "0.75rem",
      flex: 1,
      minHeight: 0
    }
  }, list.map(c => /*#__PURE__*/React.createElement(ChatListItem, {
    key: c.id,
    chat: c,
    active: c.id === activeId,
    onClick: () => setActiveId(c.id)
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: "flex",
      flexDirection: "column",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      height: 65,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1rem",
      borderBottom: "1px solid var(--color-gray-150)",
      background: "var(--surface-card)",
      boxShadow: "var(--shadow-xs)"
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => setShowProfile(true),
    style: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      background: "none",
      border: "none",
      cursor: "pointer",
      textAlign: "left",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    size: 10,
    src: chat.avatar,
    name: chat.name,
    initialColor: "auto"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-medium truncate",
    style: {
      color: "var(--text-heading)"
    }
  }, chat.name), /*#__PURE__*/React.createElement("p", {
    className: "text-xs",
    style: {
      marginTop: 2,
      color: "var(--text-body)"
    }
  }, chat.online ? "Online" : "Last seen recently"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-9 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("phone"),
    size: 1.375
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-9 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("magnifying-glass"),
    size: 1.375
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-9 rounded-full",
    color: showProfile ? "primary" : "neutral",
    onClick: () => setShowProfile(v => !v)
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("view-columns"),
    size: 1.375
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-8 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("ellipsis-vertical", "solid"),
    size: 1.25
  })))), /*#__PURE__*/React.createElement("div", {
    className: "custom-scrollbar",
    style: {
      flex: 1,
      minHeight: 0,
      overflowY: "auto",
      padding: "1.25rem 1.5rem 0"
    }
  }, (threads[activeId] || []).map((m, i) => /*#__PURE__*/React.createElement(Bubble, {
    key: i,
    m: m,
    profile: chat
  })), /*#__PURE__*/React.createElement("div", {
    ref: endRef
  })), /*#__PURE__*/React.createElement("form", {
    onSubmit: send,
    style: {
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.75rem 1.5rem",
      borderTop: "1px solid var(--color-gray-150)",
      background: "var(--surface-card)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-9 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("face-smile"),
    size: 1.375
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-9 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("paper-clip"),
    size: 1.375
  })), /*#__PURE__*/React.createElement("input", {
    value: draft,
    onChange: e => setDraft(e.target.value),
    placeholder: "Write a message...",
    style: {
      flex: 1,
      height: 40,
      border: "none",
      background: "transparent",
      outline: "none",
      fontFamily: "inherit",
      fontSize: "var(--text-sm)"
    }
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    color: "primary",
    isIcon: true,
    className: "size-9 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("paper-airplane"),
    size: 1.25
  })))), showProfile && /*#__PURE__*/React.createElement("div", {
    className: "custom-scrollbar",
    style: {
      width: 280,
      flexShrink: 0,
      background: "var(--surface-card)",
      borderLeft: "1px solid var(--color-gray-150)",
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "flex-end",
      padding: "0.75rem 0.75rem 0"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-8 rounded-full",
    onClick: () => setShowProfile(false)
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("x-mark"),
    size: 1.125
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center",
      padding: "0 1.25rem 1.25rem"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    size: 20,
    src: chat.avatar,
    name: chat.name,
    initialColor: "auto",
    style: {
      margin: "0 auto"
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-base font-medium mt-3",
    style: {
      color: "var(--text-heading)"
    }
  }, chat.name), /*#__PURE__*/React.createElement("p", {
    className: "text-xs-plus",
    style: {
      color: "var(--text-subtle)"
    }
  }, chat.role), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      gap: "0.5rem",
      marginTop: "1rem"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "soft",
    color: "primary",
    isIcon: true,
    className: "size-9 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("phone"),
    size: 1.125
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "soft",
    color: "primary",
    isIcon: true,
    className: "size-9 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("video-camera"),
    size: 1.125
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "soft",
    color: "primary",
    isIcon: true,
    className: "size-9 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("envelope"),
    size: 1.125
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      padding: "1rem 1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-tiny uppercase tracking-wider font-medium",
    style: {
      color: "var(--text-subtle)"
    }
  }, "Shared files"), [["Q2-forecast.xlsx", "412 KB", "success"], ["brand-kit.zip", "18.4 MB", "primary"], ["contract-v3.pdf", "1.2 MB", "error"]].map(([n, s, c]) => /*#__PURE__*/React.createElement("div", {
    key: n,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.625rem"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/folders/folder-" + c + ".svg",
    alt: "",
    style: {
      width: 28,
      height: 28
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-xs-plus truncate",
    style: {
      color: "var(--text-heading)"
    }
  }, n), /*#__PURE__*/React.createElement("p", {
    className: "text-tiny-plus",
    style: {
      color: "var(--text-subtle)"
    }
  }, s)))))));
}
Object.assign(window, {
  ChatApp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/apps/ChatApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/apps/KanbanBoard.jsx
try { (() => {
const {
  Avatar,
  Badge,
  Button,
  Box,
  ScrollShadow
} = window.LIFTTailuxDesignSystem_19bb17 || {};
const A = n => "../../assets/avatars/avatar-" + n + ".jpg";
const COLUMNS = [{
  id: "backlog",
  name: "Backlog",
  color: "neutral",
  icon: "inbox-stack"
}, {
  id: "progress",
  name: "In Progress",
  color: "info",
  icon: "arrow-path"
}, {
  id: "review",
  name: "In Review",
  color: "warning",
  icon: "magnifying-glass"
}, {
  id: "done",
  name: "Done",
  color: "success",
  icon: "check-circle"
}];
const TASKS = {
  backlog: [{
    id: "t1",
    title: "Audit the dark-mode surface stack across all 16 dashboards",
    color: "neutral",
    due: "Apr 2",
    labels: [["Research", "info"]],
    members: [A(1), A(5)],
    comments: 4,
    files: 1
  }, {
    id: "t2",
    title: "Replace flatpickr with a native date input on mobile",
    color: "neutral",
    labels: [["Tech debt", "warning"]],
    members: [A(3)],
    comments: 2
  }],
  progress: [{
    id: "t3",
    title: "Sales report chart — segmented range control",
    color: "info",
    cover: "../../assets/imagery/course-2.jpg",
    due: "Mar 24",
    labels: [["Frontend", "primary"], ["v1.4", "neutral"]],
    members: [A(2), A(4), A(6)],
    comments: 7,
    files: 3
  }, {
    id: "t4",
    title: "Prime panel keyboard navigation",
    color: "info",
    due: "Mar 26",
    members: [A(5)],
    comments: 1
  }],
  review: [{
    id: "t5",
    title: "POS receipt printing on Safari",
    color: "warning",
    due: "Mar 22",
    labels: [["Bug", "error"]],
    members: [A(7)],
    comments: 12,
    files: 2
  }],
  done: [{
    id: "t6",
    title: "Ship monochrome accessibility mode",
    color: "success",
    labels: [["a11y", "success"]],
    members: [A(1), A(3)],
    comments: 3
  }, {
    id: "t7",
    title: "Migrate to Tailwind CSS v4 theme layer",
    color: "success",
    labels: [["Platform", "secondary"]],
    members: [A(2)],
    comments: 9,
    files: 5
  }]
};
function TaskCard({
  t,
  onMove
}) {
  const tinted = t.color !== "neutral";
  return /*#__PURE__*/React.createElement(Box, {
    className: "card skin-shadow",
    style: {
      display: "flex",
      flexDirection: "column",
      cursor: "grab",
      background: "var(--surface-card)"
    },
    "data-color": tinted ? t.color : undefined,
    onClick: () => onMove(t.id)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      borderRadius: "var(--radius-lg)",
      background: tinted ? "color-mix(in srgb, var(--this) 10%, transparent)" : "transparent"
    }
  }, t.cover && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 4
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: t.cover,
    alt: "",
    style: {
      width: "100%",
      height: 110,
      objectFit: "cover",
      borderRadius: "var(--radius-md)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0.375rem 0.625rem 0.5rem"
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "font-medium tracking-wide",
    style: {
      color: tinted ? "var(--this)" : "var(--text-heading)"
    }
  }, t.title), (t.due || t.labels) && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.25rem",
      paddingTop: "0.5rem"
    }
  }, t.due && /*#__PURE__*/React.createElement(Badge, {
    color: t.color,
    variant: tinted ? "soft" : "filled",
    style: {
      gap: "0.25rem"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("calendar"),
    size: 0.875
  }), /*#__PURE__*/React.createElement("span", null, t.due)), (t.labels || []).map(([text, c]) => /*#__PURE__*/React.createElement(Badge, {
    key: text,
    color: c,
    variant: c === "neutral" ? "filled" : "soft"
  }, text))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: "0.25rem",
      paddingTop: "1rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, (t.members || []).map((m, i) => /*#__PURE__*/React.createElement(Avatar, {
    key: i,
    size: 5,
    src: m,
    classNames: {
      display: "text-tiny"
    },
    style: {
      marginLeft: i ? -4 : 0,
      boxShadow: "0 0 0 1px #fff",
      borderRadius: 999
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "0.625rem",
      color: "var(--text-subtle)"
    }
  }, t.files ? /*#__PURE__*/React.createElement("span", {
    className: "text-tiny-plus",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("paper-clip"),
    size: 0.875
  }), t.files) : null, t.comments ? /*#__PURE__*/React.createElement("span", {
    className: "text-tiny-plus",
    style: {
      display: "flex",
      alignItems: "center",
      gap: 3
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("chat-bubble-oval-left"),
    size: 0.875
  }), t.comments) : null)))));
}
function KanbanBoard() {
  const [tasks, setTasks] = React.useState(TASKS);
  const move = (colId, taskId) => {
    const order = COLUMNS.map(c => c.id);
    const next = order[(order.indexOf(colId) + 1) % order.length];
    setTasks(prev => {
      const task = prev[colId].find(t => t.id === taskId);
      if (!task) return prev;
      const colorByCol = {
        backlog: "neutral",
        progress: "info",
        review: "warning",
        done: "success"
      };
      return {
        ...prev,
        [colId]: prev[colId].filter(t => t.id !== taskId),
        [next]: [...prev[next], {
          ...task,
          color: colorByCol[next]
        }]
      };
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 65,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 1.5rem",
      borderBottom: "1px solid var(--color-gray-150)",
      background: "var(--surface-card)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem"
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-base font-medium",
    style: {
      color: "var(--text-heading)"
    }
  }, "Tailux v1.4 Release"), /*#__PURE__*/React.createElement(Badge, {
    color: "primary",
    variant: "soft"
  }, "Private")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, [1, 2, 3, 4].map((n, i) => /*#__PURE__*/React.createElement(Avatar, {
    key: n,
    size: 8,
    src: A(n),
    style: {
      marginLeft: i ? -8 : 0,
      boxShadow: "0 0 0 2px #fff",
      borderRadius: 999
    }
  }))), /*#__PURE__*/React.createElement(Button, {
    variant: "outlined",
    className: "text-xs-plus",
    style: {
      height: 32,
      gap: "0.375rem"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("user-plus"),
    size: 1
  }), "Invite"), /*#__PURE__*/React.createElement(Button, {
    color: "primary",
    className: "text-xs-plus",
    style: {
      height: 32
    }
  }, "Add Task"))), /*#__PURE__*/React.createElement("div", {
    className: "custom-scrollbar",
    style: {
      flex: 1,
      minHeight: 0,
      overflow: "auto",
      padding: "1.25rem 1.5rem",
      display: "flex",
      gap: "1.25rem",
      alignItems: "flex-start"
    }
  }, COLUMNS.map(col => /*#__PURE__*/React.createElement("div", {
    key: col.id,
    style: {
      width: 288,
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      maxHeight: "100%"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      paddingBottom: "0.25rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    size: 8,
    initialColor: col.color,
    initialVariant: col.color === "neutral" ? "filled" : "soft",
    classNames: {
      display: "rounded-lg"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO(col.icon),
    size: 1
  })), /*#__PURE__*/React.createElement("span", {
    className: "text-base truncate",
    style: {
      color: "var(--text-heading)"
    }
  }, col.name), /*#__PURE__*/React.createElement("span", {
    className: "text-xs",
    style: {
      color: "var(--text-subtle)"
    }
  }, tasks[col.id].length)), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-8 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("ellipsis-horizontal", "solid"),
    size: 1.125
  }))), /*#__PURE__*/React.createElement(ScrollShadow, {
    className: "hide-scrollbar",
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "0.625rem",
      paddingTop: "0.375rem",
      maxHeight: 520
    }
  }, tasks[col.id].length ? tasks[col.id].map(t => /*#__PURE__*/React.createElement(TaskCard, {
    key: t.id,
    t: t,
    onMove: id => move(col.id, id)
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.5rem",
      padding: "2.5rem 0"
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-lg",
    style: {
      color: "var(--text-muted)"
    }
  }, "No tasks"), /*#__PURE__*/React.createElement("span", {
    className: "text-sm",
    style: {
      color: "var(--text-subtle)"
    }
  }, "Add tasks here to get started")), /*#__PURE__*/React.createElement("button", {
    className: "text-xs-plus",
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.375rem",
      padding: "0.5rem",
      borderRadius: "var(--radius-lg)",
      border: "none",
      background: "transparent",
      color: "var(--text-subtle)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("plus"),
    size: 1
  }), " Add task")))), /*#__PURE__*/React.createElement("button", {
    style: {
      width: 288,
      flexShrink: 0,
      height: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      borderRadius: "var(--radius-lg)",
      border: "1px dashed var(--border-default)",
      background: "transparent",
      color: "var(--text-subtle)",
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: "var(--text-xs-plus)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("plus"),
    size: 1
  }), " Add column")));
}
Object.assign(window, {
  KanbanBoard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/apps/KanbanBoard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/auth/AuthScreens.jsx
try { (() => {
const {
  Button,
  Card,
  Checkbox,
  Input,
  InputErrorMsg
} = window.LIFTTailuxDesignSystem_19bb17 || {};
function Brand({
  size
}) {
  return /*#__PURE__*/React.createElement(Icon, {
    src: "../../assets/logo/lift-logo.svg",
    size: undefined,
    style: {
      width: size || "9.5rem",
      height: "auto",
      margin: "0 auto"
    }
  });
}
function LegalFooter() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "2rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "var(--text-xs)",
      color: "var(--text-subtle)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Privacy Notice"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 1,
      height: 12,
      background: "var(--color-gray-200)",
      margin: "0 0.625rem"
    }
  }), /*#__PURE__*/React.createElement("a", {
    href: "#"
  }, "Term of service"));
}
function OrDivider() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      margin: "1.75rem 0",
      fontSize: "var(--text-xs)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      flex: 1,
      background: "var(--color-gray-200)"
    }
  }), /*#__PURE__*/React.createElement("p", null, "OR"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      flex: 1,
      background: "var(--color-gray-200)"
    }
  }));
}
function SocialRow() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "1rem"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outlined",
    style: {
      height: 40,
      flex: 1,
      gap: "0.75rem"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/brand-logos/google.svg",
    alt: "",
    style: {
      width: 22,
      height: 22
    }
  }), /*#__PURE__*/React.createElement("span", null, "Google")), /*#__PURE__*/React.createElement(Button, {
    variant: "outlined",
    style: {
      height: 40,
      flex: 1,
      gap: "0.75rem"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/brand-logos/github.svg",
    alt: "",
    style: {
      width: 22,
      height: 22
    }
  }), /*#__PURE__*/React.createElement("span", null, "Github")));
}
function SignIn({
  onNavigate
}) {
  const [username, setUsername] = React.useState("username");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const submit = e => {
    e.preventDefault();
    setError(password.length < 6 ? "Invalid username or password" : "");
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: "26rem",
      padding: "1rem 1.25rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Brand, null), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "1rem"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-semibold",
    style: {
      color: "var(--color-gray-600)"
    }
  }, "Welcome Back"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-subtle)"
    }
  }, "Please sign in to continue"))), /*#__PURE__*/React.createElement(Card, {
    className: "mt-5",
    style: {
      padding: "1.75rem"
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: submit,
    autoComplete: "off"
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Username",
    placeholder: "Enter Username",
    value: username,
    onChange: e => setUsername(e.target.value),
    prefix: /*#__PURE__*/React.createElement(Icon, {
      src: HERO("envelope"),
      size: 1.25
    })
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: "password",
    placeholder: "Enter Password",
    value: password,
    onChange: e => setPassword(e.target.value),
    prefix: /*#__PURE__*/React.createElement(Icon, {
      src: HERO("lock-closed"),
      size: 1.25
    }),
    error: error ? true : false
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement(InputErrorMsg, {
    when: !!error
  }, error)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "1rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "Remember me"
  }), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "text-xs",
    style: {
      color: "var(--text-subtle)"
    }
  }, "Forgot Password?")), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    color: "primary",
    style: {
      marginTop: "1.25rem",
      width: "100%"
    }
  }, "Sign In")), /*#__PURE__*/React.createElement("div", {
    className: "text-xs-plus",
    style: {
      marginTop: "1rem",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", null, "Dont have Account?"), " ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate("signup");
    },
    style: {
      color: "var(--color-primary-600)"
    }
  }, "Create account"))), /*#__PURE__*/React.createElement(OrDivider, null), /*#__PURE__*/React.createElement(SocialRow, null)), /*#__PURE__*/React.createElement(LegalFooter, null));
}
function SignUp({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: "26rem",
      padding: "1rem 1.25rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement(Brand, null), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "1rem"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-2xl font-semibold",
    style: {
      color: "var(--color-gray-600)"
    }
  }, "Welcome To LIFT"), /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-subtle)"
    }
  }, "Please fill up the form to create an account"))), /*#__PURE__*/React.createElement(Card, {
    className: "mt-5",
    style: {
      padding: "1.75rem"
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "space-y-4"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Full Name",
    placeholder: "Enter Full Name",
    prefix: /*#__PURE__*/React.createElement(Icon, {
      src: HERO("user"),
      size: 1.25
    })
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Email",
    placeholder: "Enter Email",
    prefix: /*#__PURE__*/React.createElement(Icon, {
      src: HERO("envelope"),
      size: 1.25
    })
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Password",
    type: "password",
    placeholder: "Enter Password",
    prefix: /*#__PURE__*/React.createElement(Icon, {
      src: HERO("lock-closed"),
      size: 1.25
    }),
    description: "At least 8 characters, one number."
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "1rem"
    }
  }, /*#__PURE__*/React.createElement(Checkbox, {
    label: "I agree to the Privacy Notice and Term of service"
  })), /*#__PURE__*/React.createElement(Button, {
    color: "primary",
    style: {
      marginTop: "1.25rem",
      width: "100%"
    }
  }, "Create Account"), /*#__PURE__*/React.createElement("div", {
    className: "text-xs-plus",
    style: {
      marginTop: "1rem",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("span", null, "Already have an account?"), " ", /*#__PURE__*/React.createElement("a", {
    href: "#",
    onClick: e => {
      e.preventDefault();
      onNavigate("signin");
    },
    style: {
      color: "var(--color-primary-600)"
    }
  }, "Sign In"))), /*#__PURE__*/React.createElement(OrDivider, null), /*#__PURE__*/React.createElement(SocialRow, null)), /*#__PURE__*/React.createElement(LegalFooter, null));
}
function NotFound({
  onNavigate
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "100%",
      maxWidth: "42rem",
      padding: "1.5rem",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/illustrations/error-404-magnify.svg",
    alt: "",
    style: {
      width: "100%",
      maxHeight: 300,
      objectFit: "contain"
    }
  }), /*#__PURE__*/React.createElement("p", {
    className: "text-xl font-semibold",
    style: {
      paddingTop: "1rem",
      color: "var(--text-heading)"
    }
  }, "Oops. This Page Not Found."), /*#__PURE__*/React.createElement("p", {
    style: {
      paddingTop: "0.5rem",
      color: "var(--color-gray-500)"
    }
  }, "This page you are looking not available. Please back to home"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "2rem"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    color: "primary",
    className: "text-base",
    style: {
      height: 44
    },
    onClick: () => onNavigate("signin")
  }, "Back To Home")));
}
Object.assign(window, {
  SignIn,
  SignUp,
  NotFound
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/auth/AuthScreens.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/Chrome.jsx
try { (() => {
const {
  Avatar,
  AvatarDot,
  Badge,
  Button
} = window.LIFTTailuxDesignSystem_19bb17 || {};
const RAIL = [{
  id: "dashboards",
  icon: "dashboards",
  label: "Dashboards"
}, {
  id: "applications",
  icon: "applications",
  label: "Applications"
}, {
  id: "table",
  icon: "table",
  label: "Tables"
}, {
  id: "forms",
  icon: "forms",
  label: "Forms"
}, {
  id: "components",
  icon: "components",
  label: "Components"
}, {
  id: "elements",
  icon: "elements",
  label: "Elements"
}, {
  id: "prototypes",
  icon: "prototypes",
  label: "Prototypes"
}];
function IconRail({
  active,
  onSelect
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: "5rem",
      background: "var(--surface-card)",
      borderRight: "1px solid var(--color-gray-150)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      paddingTop: "0.875rem"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: "../../assets/logo/lift-mark.svg",
    size: 2.25
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.5rem",
      marginTop: "1.25rem",
      flex: 1
    }
  }, RAIL.map(it => /*#__PURE__*/React.createElement("button", {
    key: it.id,
    title: it.label,
    onClick: () => onSelect(it.id),
    style: {
      position: "relative",
      width: "2.75rem",
      height: "2.75rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-lg)",
      border: "none",
      cursor: "pointer",
      transition: "background-color 200ms var(--ease-in-out)",
      background: active === it.id ? "var(--accent-soft)" : "transparent",
      color: active === it.id ? "var(--color-primary-600)" : "var(--color-gray-500)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: "../../assets/dualicons/" + it.icon + ".svg",
    size: 1.75
  }), it.id === "applications" && /*#__PURE__*/React.createElement(Badge, {
    color: "error",
    className: "text-tiny-plus rounded-full",
    style: {
      position: "absolute",
      top: 0,
      right: 0,
      margin: "-0.25rem",
      height: "1rem",
      minWidth: "1rem",
      padding: "0 0.25rem",
      boxShadow: "0 0 0 1px #fff"
    }
  }, "3")))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.625rem 0"
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: {
      width: "2.75rem",
      height: "2.75rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-lg)",
      border: "none",
      background: "transparent",
      color: "var(--color-gray-500)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: "../../assets/dualicons/setting.svg",
    size: 1.75
  })), /*#__PURE__*/React.createElement(Avatar, {
    size: 9,
    src: "../../assets/avatars/avatar-12.jpg",
    name: "Travis Fuller",
    indicator: /*#__PURE__*/React.createElement(AvatarDot, {
      color: "success",
      style: {
        bottom: 0,
        right: 0
      }
    })
  })));
}
const PANELS = {
  dashboards: {
    title: "Dashboards",
    items: ["Sales", "CRM Analytics", "Orders", "Banking", "Crypto", "CMS Analytics", "Education", "Doctor", "Employees", "Workspaces"]
  },
  applications: {
    title: "Applications",
    items: ["Chat", "AI Chat", "Mail", "Kanban Board", "File Manager", "Point of Sale", "To-do", "Travel", "NFT Marketplace"]
  },
  table: {
    title: "Tables",
    items: ["Basic Table", "Advanced Table", "Orders Datatable", "Users Datatable"]
  },
  forms: {
    title: "Forms",
    items: ["Form Elements", "Input Mask", "Validation", "Multi-step", "File Upload", "Text Editor"]
  },
  components: {
    title: "Components",
    items: ["Accordion", "Avatar", "Badge", "Button", "Card", "Circlebar", "Collapse", "Pagination", "Progress", "Skeleton", "Spinner", "Table", "Tag", "Timeline"]
  },
  elements: {
    title: "Elements",
    items: ["Typography", "Colors", "Icons", "Utilities"]
  },
  prototypes: {
    title: "Prototypes",
    items: ["Onboarding", "Pricing", "Invoice", "Help Center"]
  }
};
function PrimePanel({
  segment,
  active,
  onSelect
}) {
  const panel = PANELS[segment] || PANELS.dashboards;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 240,
      background: "var(--surface-card)",
      borderRight: "1px solid var(--color-gray-150)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: "4rem",
      display: "flex",
      alignItems: "center",
      padding: "0 0.25rem 0 1rem",
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "text-base",
    style: {
      letterSpacing: "var(--tracking-wider)",
      color: "var(--text-heading)"
    }
  }, panel.title)), /*#__PURE__*/React.createElement("div", {
    className: "custom-scrollbar",
    style: {
      overflowY: "auto",
      padding: "0 0.75rem 1rem",
      display: "flex",
      flexDirection: "column",
      gap: 2
    }
  }, panel.items.map(it => {
    const on = it === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it,
      onClick: () => onSelect && onSelect(it),
      className: "text-xs-plus",
      style: {
        display: "flex",
        alignItems: "center",
        gap: "0.625rem",
        height: "2.25rem",
        padding: "0 0.625rem",
        borderRadius: "var(--radius-lg)",
        border: "none",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 200ms var(--ease-in-out)",
        background: on ? "var(--color-primary-600)" : "transparent",
        color: on ? "#fff" : "var(--text-muted)",
        fontWeight: on ? 500 : 400
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 6,
        height: 6,
        borderRadius: 999,
        background: on ? "#fff" : "var(--color-gray-300)",
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
      }
    }, it));
  })));
}
function AppHeader() {
  return /*#__PURE__*/React.createElement("header", {
    style: {
      height: 65,
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 var(--margin-x)",
      borderBottom: "1px solid var(--color-gray-200)",
      background: "rgb(255 255 255 / 0.8)",
      backdropFilter: "blur(4px) saturate(150%)",
      position: "sticky",
      top: 0,
      zIndex: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: 5,
      width: 20,
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      height: 2,
      width: 20,
      background: "var(--text-body)",
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      height: 2,
      width: 12,
      background: "var(--text-body)",
      borderRadius: 2
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      height: 2,
      width: 20,
      background: "var(--text-body)",
      borderRadius: 2
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "text-xs-plus",
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "0.5rem",
      height: 32,
      width: 256,
      padding: "0 0.75rem",
      borderRadius: 999,
      border: "1px solid var(--color-gray-200)",
      background: "transparent",
      cursor: "pointer",
      transition: "border-color 200ms"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("magnifying-glass"),
    size: 1
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-subtle)"
    }
  }, "Search here...")), /*#__PURE__*/React.createElement("svg", {
    width: "22",
    height: "20",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("path", {
    fill: "none",
    stroke: "currentColor",
    d: "M3.5.5h12c1.7 0 3 1.3 3 3v13c0 1.7-1.3 3-3 3h-12c-1.7 0-3-1.3-3-3v-13c0-1.7 1.3-3 3-3z",
    opacity: "0.4"
  }), /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    d: "M11.8 6L8 15.1h-.9L10.8 6h1z"
  }))), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-9 rounded-full",
    style: {
      position: "relative"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("bell"),
    size: 1.375
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      position: "absolute",
      top: 6,
      right: 8,
      width: 7,
      height: 7,
      borderRadius: 999,
      background: "var(--color-error)",
      boxShadow: "0 0 0 2px #fff"
    }
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-9 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("adjustments-horizontal"),
    size: 1.375
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-9 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("language"),
    size: 1.375
  }))));
}
Object.assign(window, {
  IconRail,
  PrimePanel,
  AppHeader,
  PANELS
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/dashboard/SalesDashboard.jsx
try { (() => {
const {
  Avatar,
  Badge,
  Button,
  Card,
  Progress,
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
  Circlebar
} = window.LIFTTailuxDesignSystem_19bb17 || {};
const PRIMARY = "#dc4b78";
const ACCENT = "#f7b46a";
const noAxis = {
  axisBorder: {
    show: false
  },
  axisTicks: {
    show: false
  }
};
function StatCard({
  label,
  value,
  delta,
  color,
  icon
}) {
  return /*#__PURE__*/React.createElement(Card, {
    className: "p-5",
    style: {
      display: "flex",
      justifyContent: "space-between"
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", null, label), /*#__PURE__*/React.createElement("p", {
    "data-color": color,
    className: "text-2xl font-medium mt-1",
    style: {
      color: "var(--this)"
    }
  }, value), /*#__PURE__*/React.createElement("p", {
    "data-color": "success",
    className: "mt-3",
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
      color: "var(--this)"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("arrow-up"),
    size: 1
  }), /*#__PURE__*/React.createElement("span", null, delta))), /*#__PURE__*/React.createElement(Avatar, {
    size: 12,
    initialVariant: "soft",
    initialColor: color,
    classNames: {
      display: "rounded-2xl"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO(icon),
    size: 1.5
  })));
}
function Overview() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--grid-gap)"
    }
  }, /*#__PURE__*/React.createElement(StatCard, {
    label: "Sales",
    value: "6.5k",
    delta: "4.3%",
    color: "info",
    icon: "presentation-chart-bar"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Customers",
    value: "12k",
    delta: "7.2%",
    color: "warning",
    icon: "users"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Products",
    value: "47k",
    delta: "8%",
    color: "success",
    icon: "cube"
  }), /*#__PURE__*/React.createElement(StatCard, {
    label: "Revenue",
    value: "$128k",
    delta: "3.69%",
    color: "secondary",
    icon: "currency-dollar"
  }));
}
const REPORT = {
  daily: {
    cats: ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00", "00:00", "02:00", "04:00"],
    series: [{
      name: "High",
      data: [51, 42, 50, 41, 31, 44, 55, 42, 28, 45, 35, 50]
    }, {
      name: "Low",
      data: [40, 30, 12, 24, 11, 32, 20, 24, 14, 25, 20, 25]
    }]
  },
  monthly: {
    cats: ["10 Mar", "11 Mar", "12 Mar", "13 Mar", "14 Mar", "15 Mar", "16 Mar", "17 Mar", "18 Mar", "19 Mar", "20 Mar", "21 Mar"],
    series: [{
      name: "High",
      data: [51, 42, 50, 41, 31, 44, 55, 42, 50, 32, 55, 23]
    }, {
      name: "Low",
      data: [40, 30, 12, 24, 11, 32, 20, 24, 25, 12, 20, 15]
    }]
  },
  yearly: {
    cats: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    series: [{
      name: "Sales",
      data: [28, 45, 35, 50, 32, 55, 23, 60, 28, 45, 35, 50]
    }, {
      name: "Profit",
      data: [14, 25, 20, 25, 12, 20, 15, 20, 14, 25, 20, 25]
    }]
  }
};
function SalesReport() {
  const [range, setRange] = React.useState("monthly");
  const d = REPORT[range];
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      gridColumn: "span 8"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.75rem 1.25rem 0"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-sm-plus font-medium tracking-wide",
    style: {
      color: "var(--text-heading)"
    }
  }, "Sales Report"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex"
    }
  }, ["daily", "monthly", "yearly"].map((r, i) => /*#__PURE__*/React.createElement("button", {
    key: r,
    onClick: () => setRange(r),
    className: "text-xs-plus",
    style: {
      height: 32,
      padding: "0 0.75rem",
      border: "1px solid var(--color-gray-300)",
      cursor: "pointer",
      marginLeft: i ? -1 : 0,
      textTransform: "capitalize",
      borderTopLeftRadius: i === 0 ? "var(--radius-lg)" : 0,
      borderBottomLeftRadius: i === 0 ? "var(--radius-lg)" : 0,
      borderTopRightRadius: i === 2 ? "var(--radius-lg)" : 0,
      borderBottomRightRadius: i === 2 ? "var(--radius-lg)" : 0,
      background: range === r ? "var(--color-gray-200)" : "transparent",
      color: "var(--text-heading)"
    }
  }, r)))), /*#__PURE__*/React.createElement(Chart, {
    key: range,
    height: 260,
    options: {
      series: d.series,
      colors: [PRIMARY, ACCENT],
      chart: {
        type: "bar",
        toolbar: {
          show: false
        }
      },
      dataLabels: {
        enabled: false
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          barHeight: "90%",
          columnWidth: "40%"
        }
      },
      legend: {
        show: false
      },
      xaxis: {
        categories: d.cats,
        ...noAxis,
        tooltip: {
          enabled: false
        }
      },
      yaxis: {
        ...noAxis,
        labels: {
          show: false
        }
      },
      grid: {
        padding: {
          left: -8,
          right: -8,
          top: 0,
          bottom: -6
        },
        borderColor: "var(--color-gray-150)"
      }
    }
  }));
}
function MiniCard({
  title,
  value,
  children,
  foot
}) {
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "font-medium tracking-wide",
    style: {
      padding: "0.75rem 1.25rem 0",
      color: "var(--text-heading)"
    }
  }, title), value && /*#__PURE__*/React.createElement("p", {
    className: "text-xl font-semibold",
    style: {
      padding: "0.25rem 1.25rem 0",
      color: "var(--text-heading)",
      flex: 1
    }
  }, value), children, foot);
}
function spark(color, data, type) {
  return {
    series: [{
      name: "v",
      data
    }],
    colors: [color],
    chart: {
      type: type || "area",
      sparkline: {
        enabled: true
      },
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 2,
      curve: "smooth"
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.1,
        stops: [20, 100, 100, 100]
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      enabled: false
    }
  };
}
function Statistics() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(12,1fr)",
      gap: "var(--grid-gap)"
    }
  }, /*#__PURE__*/React.createElement(SalesReport, null), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "span 4",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--grid-gap)"
    }
  }, /*#__PURE__*/React.createElement(MiniCard, {
    title: "Earning",
    value: "$12.5k",
    foot: /*#__PURE__*/React.createElement(Chart, {
      height: 100,
      options: spark("#eb6b91", [30, 55, 40, 70, 45, 62])
    })
  }), /*#__PURE__*/React.createElement(Card, {
    className: "p-5",
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement(Circlebar, {
    value: 82,
    color: "warning",
    size: 16,
    strokeWidth: 9
  }, /*#__PURE__*/React.createElement("span", {
    className: "text-base font-semibold",
    style: {
      color: "var(--text-heading)"
    }
  }, "4.8")), /*#__PURE__*/React.createElement("p", {
    className: "text-xs-plus",
    style: {
      color: "var(--text-subtle)"
    }
  }, "Avg. rating")), /*#__PURE__*/React.createElement(MiniCard, {
    title: "Orders",
    value: "22.6k",
    foot: /*#__PURE__*/React.createElement(Chart, {
      height: 100,
      options: spark("#f7b46a", [20, 50, 30, 60, 25, 82])
    })
  }), /*#__PURE__*/React.createElement(MiniCard, {
    title: "Completed",
    value: "94%",
    foot: /*#__PURE__*/React.createElement("div", {
      style: {
        padding: "1.5rem 1.25rem 1.25rem"
      }
    }, /*#__PURE__*/React.createElement(Progress, {
      value: 94,
      color: "success"
    }))
  })));
}
const PRODUCTS = [{
  sku: "#PRD-4821",
  name: "Nike Air Max 270",
  img: "../../assets/imagery/course-1.jpg",
  price: "$189.00",
  sold: 1204,
  status: ["Active", "success"]
}, {
  sku: "#PRD-4820",
  name: "Sony WH-1000XM5",
  img: "../../assets/imagery/course-2.jpg",
  price: "$349.00",
  sold: 872,
  status: ["Active", "success"]
}, {
  sku: "#PRD-4816",
  name: "Herman Miller Aeron",
  img: "../../assets/imagery/course-3.jpg",
  price: "$1,395.00",
  sold: 96,
  status: ["Low stock", "warning"]
}, {
  sku: "#PRD-4811",
  name: "Chemex Pour-Over 6-Cup",
  img: "../../assets/imagery/food-1.jpg",
  price: "$52.00",
  sold: 0,
  status: ["Out of stock", "error"]
}];
function ProductsTable() {
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      gridColumn: "span 8",
      display: "flex",
      flexDirection: "column"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.75rem 1.25rem"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-sm-plus font-medium tracking-wide",
    style: {
      color: "var(--text-heading)"
    }
  }, "Top Products"), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-8 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("ellipsis-horizontal", "solid"),
    size: 1.25
  }))), /*#__PURE__*/React.createElement(Table, {
    hoverable: true,
    className: "w-full"
  }, /*#__PURE__*/React.createElement(THead, null, /*#__PURE__*/React.createElement(Tr, {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Th, null, "Product"), /*#__PURE__*/React.createElement(Th, null, "SKU"), /*#__PURE__*/React.createElement(Th, {
    className: "text-right"
  }, "Price"), /*#__PURE__*/React.createElement(Th, {
    className: "text-right"
  }, "Sold"), /*#__PURE__*/React.createElement(Th, null, "Status"))), /*#__PURE__*/React.createElement(TBody, null, PRODUCTS.map(p => /*#__PURE__*/React.createElement(Tr, {
    key: p.sku
  }, /*#__PURE__*/React.createElement(Td, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: p.img,
    alt: "",
    style: {
      width: 34,
      height: 34,
      borderRadius: "var(--radius-lg)",
      objectFit: "cover"
    }
  }), /*#__PURE__*/React.createElement("span", {
    className: "font-medium",
    style: {
      color: "var(--text-heading)"
    }
  }, p.name))), /*#__PURE__*/React.createElement(Td, {
    style: {
      color: "var(--text-subtle)"
    }
  }, p.sku), /*#__PURE__*/React.createElement(Td, {
    className: "text-right font-medium",
    style: {
      color: "var(--text-heading)"
    }
  }, p.price), /*#__PURE__*/React.createElement(Td, {
    className: "text-right"
  }, p.sold.toLocaleString()), /*#__PURE__*/React.createElement(Td, null, /*#__PURE__*/React.createElement(Badge, {
    color: p.status[1],
    variant: "soft"
  }, p.status[0])))))));
}
function CurrentBalance() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      borderRadius: "var(--radius-lg)",
      padding: "0 1.25rem 1.25rem",
      background: "var(--gradient-brand-deep)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: "50%",
      marginTop: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement(Chart, {
    height: 80,
    options: {
      series: [{
        name: "Earning",
        data: [0, 20, 50, 10]
      }],
      colors: ["#fff"],
      chart: {
        type: "line",
        sparkline: {
          enabled: true
        },
        toolbar: {
          show: false
        }
      },
      stroke: {
        width: 3,
        curve: "smooth"
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        enabled: false
      }
    }
  })), /*#__PURE__*/React.createElement("p", {
    className: "text-3xl font-semibold",
    style: {
      marginTop: "1.5rem"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "rgb(255 255 255 / 0.8)"
    }
  }, "$"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: "#fff"
    }
  }, "31.313")), /*#__PURE__*/React.createElement("p", {
    className: "font-medium tracking-wide",
    style: {
      color: "rgb(255 255 255 / 0.8)"
    }
  }, "Current Balance"), /*#__PURE__*/React.createElement("button", {
    style: {
      marginTop: "1.25rem",
      width: "100%",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      borderRadius: 999,
      border: "1px solid rgb(255 255 255 / 0.3)",
      padding: "0.5rem 1.25rem",
      color: "#fff",
      background: "transparent",
      cursor: "pointer",
      fontWeight: 500,
      letterSpacing: "var(--tracking-wide)",
      transition: "background 200ms"
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("arrow-down-circle"),
    size: 1.125
  }), /*#__PURE__*/React.createElement("span", null, "Get Statement")));
}
const SELLERS = [{
  name: "Travis Fuller",
  role: "Sales manager",
  avatar: "../../assets/avatars/avatar-1.jpg",
  value: "$8,204"
}, {
  name: "Konnor Guzman",
  role: "Account executive",
  avatar: "../../assets/avatars/avatar-2.jpg",
  value: "$6,180"
}, {
  name: "Katrina West",
  role: "Partner lead",
  avatar: "../../assets/avatars/avatar-3.jpg",
  value: "$4,920"
}, {
  name: "Henry Curtis",
  role: "Field sales",
  avatar: null,
  value: "$3,140"
}];
function TopSellers() {
  return /*#__PURE__*/React.createElement(Card, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.75rem 1.25rem"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-sm-plus font-medium tracking-wide",
    style: {
      color: "var(--text-heading)"
    }
  }, "Top Sellers"), /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    className: "text-xs-plus",
    color: "primary",
    style: {
      height: 28,
      padding: "0 0.625rem"
    }
  }, "View all")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 1.25rem 1.25rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.875rem"
    }
  }, SELLERS.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.name,
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    size: 9,
    src: s.avatar,
    name: s.name,
    initialColor: "auto"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("p", {
    className: "font-medium truncate",
    style: {
      color: "var(--text-heading)"
    }
  }, s.name), /*#__PURE__*/React.createElement("p", {
    className: "text-xs truncate",
    style: {
      color: "var(--text-subtle)"
    }
  }, s.role)), /*#__PURE__*/React.createElement("span", {
    className: "font-medium",
    style: {
      color: "var(--text-heading)"
    }
  }, s.value)))));
}
const TX = [{
  id: "#8842",
  who: "Ella Bell",
  avatar: "../../assets/avatars/avatar-4.jpg",
  method: "Visa •••• 4242",
  date: "Mar 21, 14:02",
  amount: "$1,204.00",
  status: ["Paid", "success"]
}, {
  id: "#8841",
  who: "Konnor Guzman",
  avatar: "../../assets/avatars/avatar-5.jpg",
  method: "Mastercard •••• 8891",
  date: "Mar 21, 11:47",
  amount: "$318.50",
  status: ["Pending", "warning"]
}, {
  id: "#8840",
  who: "Derrick Simmons",
  avatar: "../../assets/avatars/avatar-6.jpg",
  method: "PayPal",
  date: "Mar 20, 19:12",
  amount: "$92.00",
  status: ["Refunded", "error"]
}, {
  id: "#8839",
  who: "Samantha Shelton",
  avatar: "../../assets/avatars/avatar-7.jpg",
  method: "Bank transfer",
  date: "Mar 20, 09:31",
  amount: "$2,450.00",
  status: ["Paid", "success"]
}];
function Transactions() {
  return /*#__PURE__*/React.createElement(Card, {
    style: {
      gridColumn: "span 12"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0.75rem 1.25rem"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    className: "text-sm-plus font-medium tracking-wide",
    style: {
      color: "var(--text-heading)"
    }
  }, "Recent Transactions"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "0.5rem"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "outlined",
    className: "text-xs-plus",
    style: {
      height: 32
    }
  }, "Export"), /*#__PURE__*/React.createElement(Button, {
    color: "primary",
    className: "text-xs-plus",
    style: {
      height: 32
    }
  }, "New Invoice"))), /*#__PURE__*/React.createElement(Table, {
    hoverable: true,
    className: "w-full"
  }, /*#__PURE__*/React.createElement(THead, null, /*#__PURE__*/React.createElement(Tr, {
    style: {
      borderTop: "1px solid var(--border-subtle)",
      borderBottom: "1px solid var(--border-subtle)"
    }
  }, /*#__PURE__*/React.createElement(Th, null, "Order"), /*#__PURE__*/React.createElement(Th, null, "Customer"), /*#__PURE__*/React.createElement(Th, null, "Method"), /*#__PURE__*/React.createElement(Th, null, "Date"), /*#__PURE__*/React.createElement(Th, null, "Status"), /*#__PURE__*/React.createElement(Th, {
    className: "text-right"
  }, "Amount"), /*#__PURE__*/React.createElement(Th, null))), /*#__PURE__*/React.createElement(TBody, null, TX.map(t => /*#__PURE__*/React.createElement(Tr, {
    key: t.id
  }, /*#__PURE__*/React.createElement(Td, {
    className: "font-medium",
    style: {
      color: "var(--text-heading)"
    }
  }, t.id), /*#__PURE__*/React.createElement(Td, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem"
    }
  }, /*#__PURE__*/React.createElement(Avatar, {
    size: 8,
    src: t.avatar,
    name: t.who,
    initialColor: "auto"
  }), /*#__PURE__*/React.createElement("span", null, t.who))), /*#__PURE__*/React.createElement(Td, {
    style: {
      color: "var(--text-muted)"
    }
  }, t.method), /*#__PURE__*/React.createElement(Td, {
    style: {
      color: "var(--text-subtle)"
    }
  }, t.date), /*#__PURE__*/React.createElement(Td, null, /*#__PURE__*/React.createElement(Badge, {
    color: t.status[1],
    variant: "soft"
  }, t.status[0])), /*#__PURE__*/React.createElement(Td, {
    className: "text-right font-medium",
    style: {
      color: "var(--text-heading)"
    }
  }, t.amount), /*#__PURE__*/React.createElement(Td, {
    className: "text-right"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "flat",
    isIcon: true,
    className: "size-8 rounded-full"
  }, /*#__PURE__*/React.createElement(Icon, {
    src: HERO("ellipsis-horizontal", "solid"),
    size: 1.125
  }))))))));
}
function SalesDashboard() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "1.5rem var(--margin-x) 2rem",
      display: "flex",
      flexDirection: "column",
      gap: "var(--grid-gap)"
    }
  }, /*#__PURE__*/React.createElement(Overview, null), /*#__PURE__*/React.createElement(Statistics, null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(12,1fr)",
      gap: "var(--grid-gap)"
    }
  }, /*#__PURE__*/React.createElement(ProductsTable, null), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "span 4",
      display: "flex",
      flexDirection: "column",
      gap: "var(--grid-gap)"
    }
  }, /*#__PURE__*/React.createElement(CurrentBalance, null), /*#__PURE__*/React.createElement(TopSellers, null)), /*#__PURE__*/React.createElement(Transactions, null)));
}
Object.assign(window, {
  SalesDashboard
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/dashboard/SalesDashboard.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.AvatarDot = __ds_scope.AvatarDot;

__ds_ns.Box = __ds_scope.Box;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CopyButton = __ds_scope.CopyButton;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Circlebar = __ds_scope.Circlebar;

__ds_ns.GhostSpinner = __ds_scope.GhostSpinner;

__ds_ns.Progress = __ds_scope.Progress;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.Spinner = __ds_scope.Spinner;

__ds_ns.Table = __ds_scope.Table;

__ds_ns.THead = __ds_scope.THead;

__ds_ns.TBody = __ds_scope.TBody;

__ds_ns.TFoot = __ds_scope.TFoot;

__ds_ns.Tr = __ds_scope.Tr;

__ds_ns.Th = __ds_scope.Th;

__ds_ns.Td = __ds_scope.Td;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Timeline = __ds_scope.Timeline;

__ds_ns.TimelineItem = __ds_scope.TimelineItem;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.InputErrorMsg = __ds_scope.InputErrorMsg;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.Range = __ds_scope.Range;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Swap = __ds_scope.Swap;

__ds_ns.SwapOn = __ds_scope.SwapOn;

__ds_ns.SwapOff = __ds_scope.SwapOff;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Upload = __ds_scope.Upload;

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.AccordionItem = __ds_scope.AccordionItem;

__ds_ns.Collapse = __ds_scope.Collapse;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.ScrollShadow = __ds_scope.ScrollShadow;

})();
