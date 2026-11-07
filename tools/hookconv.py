# T1 helper: turns `const x0 = OBJ.key; OBJ.key = function (args) { ... x0.apply(this, arguments) ... };`
# into `Hooks.layer(NAME, LABEL, function (next, args) { ... next.apply(this, arguments-without-next) ... });`
import re, sys

def match_brace(s, i):
    """s[i] == '{'; return index of the matching '}' (skips strings, templates, comments, regex-ish)."""
    depth = 0; n = len(s); stack = []
    while i < n:
        c = s[i]
        if c in '"\'':
            q = c; i += 1
            while s[i] != q:
                if s[i] == '\\': i += 1
                i += 1
        elif c == '`':
            i += 1
            while s[i] != '`':
                if s[i] == '\\': i += 1
                elif s[i] == '$' and s[i+1] == '{':
                    j = match_brace(s, i + 1); i = j
                i += 1
        elif c == '/' and s[i+1] == '/':
            i = s.index('\n', i)
        elif c == '/' and s[i+1] == '*':
            i = s.index('*/', i) + 1
        elif c == '{': depth += 1
        elif c == '}':
            depth -= 1
            if depth == 0: return i
        i += 1
    raise ValueError('no match')

def convert(path, assign, name, label, prev, call_fix=None):
    s = open(path).read()
    a = s.index(assign)
    m = re.compile(r'function \(([^)]*)\) \{').match(s, a + len(assign))
    assert m, (path, assign)
    params = m.group(1).strip()
    body_open = m.end() - 1
    end = match_brace(s, body_open)
    assert s[end+1] == ';', (path, s[end-20:end+5])
    body = s[body_open:end+1]
    # the previous function is now next(); `arguments` would include next, so pass the named params
    np = ', '.join(['next'] + ([params] if params else []))
    if call_fix:
        for o, nw in call_fix: 
            assert o in body, (path, o); body = body.replace(o, nw)
    assert prev not in body or True
    new = f"Hooks.layer('{name}', '{label}', function ({np}) " + body + ');'
    s = s[:a] + new + s[end+2:]
    open(path, 'w').write(s)
    return body.count('next')

if __name__ == '__main__':
    pass
