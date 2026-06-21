module.exports = [
"[project]/components/InputField/InputField.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "errorMsg": "InputField-module__z5Ri9q__errorMsg",
  "group": "InputField-module__z5Ri9q__group",
  "hasIcon": "InputField-module__z5Ri9q__hasIcon",
  "hasTrailing": "InputField-module__z5Ri9q__hasTrailing",
  "input": "InputField-module__z5Ri9q__input",
  "inputWrap": "InputField-module__z5Ri9q__inputWrap",
  "label": "InputField-module__z5Ri9q__label",
  "leadingIcon": "InputField-module__z5Ri9q__leadingIcon",
  "trailingBtn": "InputField-module__z5Ri9q__trailingBtn",
});
}),
"[project]/components/InputField/InputField.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InputField
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/components/InputField/InputField.module.css [app-ssr] (css module)");
/**
 * InputField Component
 * A production-ready, accessible text input with label, floating helper text,
 * optional leading icon, optional show/hide toggle for passwords.
 * Uses :user-invalid + :has() for native CSS error styling with JS fallback.
 */ "use client";
;
;
;
function InputField({ label, name, type = "text", placeholder, autoComplete, required = false, defaultValue, icon }) {
    const uid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useId"])();
    const inputId = `field-${uid}-${name}`;
    const [showPw, setShowPw] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const isPassword = type === "password";
    const resolvedType = isPassword ? showPw ? "text" : "password" : type;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].group,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                htmlFor: inputId,
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].label,
                children: label
            }, void 0, false, {
                fileName: "[project]/components/InputField/InputField.tsx",
                lineNumber: 43,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputWrap,
                children: [
                    icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].leadingIcon,
                        "aria-hidden": "true",
                        children: icon
                    }, void 0, false, {
                        fileName: "[project]/components/InputField/InputField.tsx",
                        lineNumber: 48,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: inputId,
                        name: name,
                        type: resolvedType,
                        placeholder: placeholder,
                        autoComplete: autoComplete,
                        required: required,
                        defaultValue: defaultValue,
                        "aria-required": required,
                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].input} ${icon ? __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].hasIcon : ""} ${isPassword ? __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].hasTrailing : ""}`
                    }, void 0, false, {
                        fileName: "[project]/components/InputField/InputField.tsx",
                        lineNumber: 52,
                        columnNumber: 9
                    }, this),
                    isPassword && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].trailingBtn,
                        onClick: ()=>setShowPw((v)=>!v),
                        "aria-label": showPw ? "Hide password" : "Show password",
                        children: showPw ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EyeOffIcon, {}, void 0, false, {
                            fileName: "[project]/components/InputField/InputField.tsx",
                            lineNumber: 72,
                            columnNumber: 23
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(EyeIcon, {}, void 0, false, {
                            fileName: "[project]/components/InputField/InputField.tsx",
                            lineNumber: 72,
                            columnNumber: 40
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/InputField/InputField.tsx",
                        lineNumber: 66,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/InputField/InputField.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].errorMsg,
                "aria-live": "polite",
                role: "alert"
            }, void 0, false, {
                fileName: "[project]/components/InputField/InputField.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/InputField/InputField.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
/* ── Inline SVG icons ────────────────────────────────────────────── */ function EyeIcon() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
            }, void 0, false, {
                fileName: "[project]/components/InputField/InputField.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                cx: "12",
                cy: "12",
                r: "3"
            }, void 0, false, {
                fileName: "[project]/components/InputField/InputField.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/InputField/InputField.tsx",
        lineNumber: 85,
        columnNumber: 5
    }, this);
}
function EyeOffIcon() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 24 24",
        "aria-hidden": "true",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
            }, void 0, false, {
                fileName: "[project]/components/InputField/InputField.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                x1: "1",
                y1: "1",
                x2: "23",
                y2: "23"
            }, void 0, false, {
                fileName: "[project]/components/InputField/InputField.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/InputField/InputField.tsx",
        lineNumber: 94,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/PrimaryButton/PrimaryButton.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "btn": "PrimaryButton-module__3k1C-G__btn",
  "fullWidth": "PrimaryButton-module__3k1C-G__fullWidth",
  "ghost": "PrimaryButton-module__3k1C-G__ghost",
  "loading": "PrimaryButton-module__3k1C-G__loading",
  "loadingText": "PrimaryButton-module__3k1C-G__loadingText",
  "primary": "PrimaryButton-module__3k1C-G__primary",
  "spin": "PrimaryButton-module__3k1C-G__spin",
  "spinner": "PrimaryButton-module__3k1C-G__spinner",
});
}),
"[project]/components/PrimaryButton/PrimaryButton.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PrimaryButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * PrimaryButton Component
 * A themed, accessible button supporting loading state and full-width variant.
 * Primary style is golden gradient with glow shadow; ghost variant is outlined.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PrimaryButton$2f$PrimaryButton$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/components/PrimaryButton/PrimaryButton.module.css [app-ssr] (css module)");
;
;
function PrimaryButton({ variant = "primary", isLoading = false, fullWidth = false, children, disabled, className = "", ...rest }) {
    const isDisabled = disabled || isLoading;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        ...rest,
        disabled: isDisabled,
        "aria-busy": isLoading,
        className: [
            __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PrimaryButton$2f$PrimaryButton$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].btn,
            __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PrimaryButton$2f$PrimaryButton$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"][variant],
            fullWidth ? __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PrimaryButton$2f$PrimaryButton$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].fullWidth : "",
            isLoading ? __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PrimaryButton$2f$PrimaryButton$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].loading : "",
            className
        ].filter(Boolean).join(" "),
        children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PrimaryButton$2f$PrimaryButton$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].spinner,
                    "aria-hidden": "true"
                }, void 0, false, {
                    fileName: "[project]/components/PrimaryButton/PrimaryButton.tsx",
                    lineNumber: 47,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PrimaryButton$2f$PrimaryButton$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].loadingText,
                    children: "Signing in…"
                }, void 0, false, {
                    fileName: "[project]/components/PrimaryButton/PrimaryButton.tsx",
                    lineNumber: 48,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true) : children
    }, void 0, false, {
        fileName: "[project]/components/PrimaryButton/PrimaryButton.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/LoginForm/LoginForm.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "checkLabel": "LoginForm-module__8TI3QG__checkLabel",
  "checkText": "LoginForm-module__8TI3QG__checkText",
  "checkbox": "LoginForm-module__8TI3QG__checkbox",
  "checkmark": "LoginForm-module__8TI3QG__checkmark",
  "errorBanner": "LoginForm-module__8TI3QG__errorBanner",
  "errorIcon": "LoginForm-module__8TI3QG__errorIcon",
  "forgotLink": "LoginForm-module__8TI3QG__forgotLink",
  "form": "LoginForm-module__8TI3QG__form",
  "linkIcon": "LoginForm-module__8TI3QG__linkIcon",
  "row": "LoginForm-module__8TI3QG__row",
  "slideIn": "LoginForm-module__8TI3QG__slideIn",
});
}),
"[project]/components/LoginForm/LoginForm.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
/**
 * LoginForm Component
 * Handles the sign-in form logic, validation, and loading state.
 * Separated from page.tsx so it can be used as a pure client component.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/InputField/InputField.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PrimaryButton$2f$PrimaryButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/PrimaryButton/PrimaryButton.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginForm$2f$LoginForm$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/components/LoginForm/LoginForm.module.css [app-ssr] (css module)");
"use client";
;
;
;
;
;
function LoginForm() {
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const formRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    async function handleSubmit(e) {
        e.preventDefault();
        if (!formRef.current?.checkValidity()) {
            formRef.current?.reportValidity();
            return;
        }
        setError(null);
        setIsLoading(true);
        // Simulate network request — replace with real auth call
        await new Promise((res)=>setTimeout(res, 1800));
        // TODO: Replace with actual authentication logic
        // const formData = new FormData(formRef.current!);
        // const result = await signIn(formData.get("email"), formData.get("password"));
        setIsLoading(false);
        setError("Invalid email or password. Please try again.");
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        id: "login-form",
        ref: formRef,
        onSubmit: handleSubmit,
        noValidate: true,
        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginForm$2f$LoginForm$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].form,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                label: "Email Address",
                name: "email",
                type: "email",
                placeholder: "you@example.com",
                autoComplete: "email",
                required: true
            }, void 0, false, {
                fileName: "[project]/components/LoginForm/LoginForm.tsx",
                lineNumber: 48,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$InputField$2f$InputField$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                label: "Password",
                name: "password",
                type: "password",
                placeholder: "••••••••••",
                autoComplete: "current-password",
                required: true
            }, void 0, false, {
                fileName: "[project]/components/LoginForm/LoginForm.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginForm$2f$LoginForm$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].row,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginForm$2f$LoginForm$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].checkLabel,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                id: "remember-me",
                                name: "remember",
                                type: "checkbox",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginForm$2f$LoginForm$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].checkbox
                            }, void 0, false, {
                                fileName: "[project]/components/LoginForm/LoginForm.tsx",
                                lineNumber: 69,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginForm$2f$LoginForm$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].checkmark,
                                "aria-hidden": "true"
                            }, void 0, false, {
                                fileName: "[project]/components/LoginForm/LoginForm.tsx",
                                lineNumber: 75,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginForm$2f$LoginForm$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].checkText,
                                children: "Remember Me"
                            }, void 0, false, {
                                fileName: "[project]/components/LoginForm/LoginForm.tsx",
                                lineNumber: 76,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/LoginForm/LoginForm.tsx",
                        lineNumber: 68,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/forgot-password",
                        id: "forgot-password-link",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginForm$2f$LoginForm$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].forgotLink,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                viewBox: "0 0 24 24",
                                "aria-hidden": "true",
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginForm$2f$LoginForm$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].linkIcon,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                        cx: "12",
                                        cy: "12",
                                        r: "10"
                                    }, void 0, false, {
                                        fileName: "[project]/components/LoginForm/LoginForm.tsx",
                                        lineNumber: 85,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                        d: "M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
                                    }, void 0, false, {
                                        fileName: "[project]/components/LoginForm/LoginForm.tsx",
                                        lineNumber: 86,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                        x1: "12",
                                        y1: "17",
                                        x2: "12.01",
                                        y2: "17"
                                    }, void 0, false, {
                                        fileName: "[project]/components/LoginForm/LoginForm.tsx",
                                        lineNumber: 87,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/LoginForm/LoginForm.tsx",
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            "Forgot my password"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/LoginForm/LoginForm.tsx",
                        lineNumber: 79,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/LoginForm/LoginForm.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                role: "alert",
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginForm$2f$LoginForm$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].errorBanner,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        viewBox: "0 0 24 24",
                        "aria-hidden": "true",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginForm$2f$LoginForm$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].errorIcon,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                cx: "12",
                                cy: "12",
                                r: "10"
                            }, void 0, false, {
                                fileName: "[project]/components/LoginForm/LoginForm.tsx",
                                lineNumber: 97,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                x1: "15",
                                y1: "9",
                                x2: "9",
                                y2: "15"
                            }, void 0, false, {
                                fileName: "[project]/components/LoginForm/LoginForm.tsx",
                                lineNumber: 98,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                x1: "9",
                                y1: "9",
                                x2: "15",
                                y2: "15"
                            }, void 0, false, {
                                fileName: "[project]/components/LoginForm/LoginForm.tsx",
                                lineNumber: 99,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/LoginForm/LoginForm.tsx",
                        lineNumber: 96,
                        columnNumber: 11
                    }, this),
                    error
                ]
            }, void 0, true, {
                fileName: "[project]/components/LoginForm/LoginForm.tsx",
                lineNumber: 95,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$PrimaryButton$2f$PrimaryButton$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                type: "submit",
                fullWidth: true,
                isLoading: isLoading,
                id: "sign-in-btn",
                children: "Sign In"
            }, void 0, false, {
                fileName: "[project]/components/LoginForm/LoginForm.tsx",
                lineNumber: 105,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/LoginForm/LoginForm.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=_0gsqkpp._.js.map