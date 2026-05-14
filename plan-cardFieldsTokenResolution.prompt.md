## Plan: Enhance card-fields token field resolution

TL;DR: Update placeholder field resolution in `app/utils/descriptionPlaceholders.ts` so field tokens support nested keys and base/upgraded numeric fields, and otherwise display field values as strings.

**Steps**
1. Add a nested field lookup helper in `app/utils/descriptionPlaceholders.ts`.
   - Parse `fieldKey` by splitting on `.`.
   - Walk the card object for each path segment.
   - Return `undefined` if any intermediate value is missing or not an object.
2. Add a generic field resolver helper in `app/utils/descriptionPlaceholders.ts`.
   - If the resolved value is an object with `base` or `upgraded`, use `tieredNumeric(card, value)`.
   - If the resolved value is a number, return it directly.
   - If it is boolean or string, return its string form.
   - If it is any other object/array, return `JSON.stringify(value)`.
   - If missing, return an empty string.
3. Update `buildResolver` in `app/utils/descriptionPlaceholders.ts`.
   - For `resolverType === "field"`, resolve the field via the new helper rather than `card[fieldKey]`.
4. Keep `CardFieldEditorClient.tsx` unchanged unless further issues arise.

**Verification**
1. Create or use a field token rule for a numbered object field like `damage` and verify base/upgraded values render correctly in the preview.
2. Create a field token rule with a nested field key such as `someField.subField` and ensure the editor renders its value as text.
3. Confirm new token field paths with dot notation can be entered and saved in the `editors/card-fields` route.

**Decisions**
- Support dot-separated nested fields through the existing field token API.
- Treat non-base/upgraded values as string output rather than forcing numeric resolution.
- Leave rule UI behavior unchanged.
