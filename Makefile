VERSION = 0.0.3

ARCH        = arm64
MACOS_MIN   = 26.0

CC         ?= clang
CFLAGS     ?= -O2
CFLAGS     += -Wall -Wextra -fno-objc-arc -arch $(ARCH) \
              -mmacosx-version-min=$(MACOS_MIN) -DFERRY_VERSION='"$(VERSION)"'
# AppKit is linked although no AppKit API is called: the window server ignores
# the bridged move operation from processes that have not loaded it.
FRAMEWORKS  = -framework AppKit -framework ApplicationServices \
              -F/System/Library/PrivateFrameworks -framework SkyLight

PREFIX ?= /usr/local
BIN     = build/ferry

.PHONY: all test test-follow install clean

all: $(BIN)

$(BIN): src/ferry.m Makefile
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) $< -o $@ $(FRAMEWORKS)

test: $(BIN)
	tests/cli.sh $(BIN) $(VERSION)
	tests/binary.sh $(BIN) $(ARCH) $(MACOS_MIN)

# Requires a live desktop and Accessibility; temporarily switches Spaces.
test-follow: $(BIN) build/follow-test
	build/follow-test $(abspath $(BIN))

build/follow-test: tests/follow.m Makefile
	@mkdir -p $(dir $@)
	$(CC) $(CFLAGS) $< -o $@ $(FRAMEWORKS)

install: $(BIN)
	install -d $(DESTDIR)$(PREFIX)/bin
	install -m 0755 $(BIN) $(DESTDIR)$(PREFIX)/bin/ferry

clean:
	rm -rf build
