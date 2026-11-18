VERSION = 0.0.4

ARCH        = arm64
MACOS_MIN   = 26.0

CC         ?= clang
CFLAGS     ?= -O2
BUILD_FLAGS = -Wall -Wextra -fno-objc-arc -arch $(ARCH) -mmacosx-version-min=$(MACOS_MIN)
# AppKit is linked although no AppKit API is called: the window server ignores
# the bridged move operation from processes that have not loaded it.
FRAMEWORKS  = -framework AppKit -framework ApplicationServices \
              -F/System/Library/PrivateFrameworks -framework SkyLight

PREFIX ?= /usr/local
BIN     = build/ferry

.PHONY: all print-version test test-binary test-follow install clean

all: $(BIN)

print-version:
	@printf '%s\n' "$(VERSION)"

$(BIN): src/ferry.m Makefile
	@mkdir -p "$(@D)"
	$(CC) $(CFLAGS) $(BUILD_FLAGS) -DFERRY_VERSION='"$(VERSION)"' "$<" -o "$@" $(FRAMEWORKS)

test: test-binary
	tests/cli.sh "$(BIN)" "$(VERSION)"
	tests/raycast.sh

test-binary: $(BIN)
	tests/binary.sh "$(BIN)" "$(ARCH)" "$(MACOS_MIN)"

# Requires a live desktop and Accessibility; temporarily switches Spaces.
test-follow: $(BIN) build/follow-test
	build/follow-test "$(abspath $(BIN))"

build/follow-test: tests/follow.m Makefile
	@mkdir -p "$(@D)"
	$(CC) $(CFLAGS) $(BUILD_FLAGS) "$<" -o "$@" $(FRAMEWORKS)

install: $(BIN)
	install -d "$(DESTDIR)$(PREFIX)/bin"
	install -m 0755 "$(BIN)" "$(DESTDIR)$(PREFIX)/bin/ferry"

clean:
	rm -rf build
