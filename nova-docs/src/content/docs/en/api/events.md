---
title: "events — DOM Event Handling"
---



Bind native DOM events with `actions.events.patchAsync`:

```typescript
const schema = v.pipe(
  v.string(),
  actions.events.patchAsync({
    click: (event: Event) => {
      console.log('clicked', event);
    },
    keydown: (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        // handle the Enter key
      }
    },
  }),
);
```

## Next Steps

- [API: inputs](en/api/inputs/) — setting component inputs
- [API: outputs](en/api/outputs/) — setting component outputs
- [API: Wrappers](en/api/wrappers/) — complete wrapper guide
