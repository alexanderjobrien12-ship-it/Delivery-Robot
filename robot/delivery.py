#!/usr/bin/env python3
"""
LEGO EV3 Delivery Robot
-----------------------
This script runs on the EV3 brick using ev3dev.
It polls your backend server every few seconds asking "any orders?"
When one arrives, it drives to the right room and marks it delivered.

Hardware assumed:
  - Left motor  → Output Port B
  - Right motor → Output Port C
  - Ultrasonic distance sensor → Input Port 1 (optional, for obstacle detection)

Before running this on the EV3:
  1. Flash your EV3 with ev3dev: https://www.ev3dev.org/docs/getting-started/
  2. Copy this file to the EV3 (via SSH or a USB stick)
  3. Fill in BACKEND_URL and ROBOT_SECRET below
  4. Run: python3 delivery.py
"""

import time
import urllib.request
import urllib.error
import json

# ── Configuration ─────────────────────────────────────────────────────────────
# Replace this with your real Render backend URL once you deploy it.
# While testing on your home network, use your computer's local IP:
#   Mac: System Settings → Wi-Fi → Details → IP Address (e.g. 192.168.1.42)
#   Then use: http://192.168.1.42:3001
BACKEND_URL  = "http://YOUR_COMPUTER_IP:3001"

# Must match the ROBOT_SECRET in your backend .env file
ROBOT_SECRET = "change-me-to-something-secret"

# How many seconds between polls ("is there an order for me?")
POLL_INTERVAL = 3

# ── Room navigation ────────────────────────────────────────────────────────────
# Each room name maps to a function that drives the robot there.
# We'll build these out one at a time as you test each route.
# For now they contain placeholder timings — tune them in real life.

def go_to_living_room(motors):
    """Drive to the Living Room."""
    print("Heading to Living Room...")
    drive_forward(motors, seconds=3)
    turn_left(motors, degrees=90)
    drive_forward(motors, seconds=2)

def go_to_dining_room(motors):
    """Drive to the Dining Room."""
    print("Heading to Dining Room...")
    drive_forward(motors, seconds=5)

def go_to_formal_living_room(motors):
    """Drive to the Formal Living Room."""
    print("Heading to Formal Living Room...")
    drive_forward(motors, seconds=3)
    turn_right(motors, degrees=45)
    drive_forward(motors, seconds=3)

# Map room names (must match exactly what the website sends) to functions
ROOM_ROUTES = {
    "Living Room":        go_to_living_room,
    "Dining Room":        go_to_dining_room,
    "Formal Living Room": go_to_formal_living_room,
}

# ── Motor helpers ──────────────────────────────────────────────────────────────
# These functions keep the movement code clean and readable.
# Adjust speed (0–100) and timing to match your actual robot.

def drive_forward(motors, seconds, speed=50):
    left, right = motors
    left.run_timed(time_sp=seconds * 1000, speed_sp=speed)
    right.run_timed(time_sp=seconds * 1000, speed_sp=speed)
    time.sleep(seconds + 0.1)  # wait for motors to finish

def turn_left(motors, degrees, speed=40):
    """Spin left in place."""
    left, right = motors
    duration = degrees / 180  # rough approximation — tune per your robot
    left.run_timed(time_sp=int(duration * 1000), speed_sp=-speed)
    right.run_timed(time_sp=int(duration * 1000), speed_sp=speed)
    time.sleep(duration + 0.1)

def turn_right(motors, degrees, speed=40):
    """Spin right in place."""
    left, right = motors
    duration = degrees / 180
    left.run_timed(time_sp=int(duration * 1000), speed_sp=speed)
    right.run_timed(time_sp=int(duration * 1000), speed_sp=-speed)
    time.sleep(duration + 0.1)

def stop(motors):
    for m in motors:
        m.stop()

# ── HTTP helpers ───────────────────────────────────────────────────────────────
# Python's built-in urllib lets us make HTTP requests without installing anything.

def api_get(path):
    """Make a GET request to the backend. Returns parsed JSON or None."""
    url = BACKEND_URL + path
    req = urllib.request.Request(url, headers={"x-robot-secret": ROBOT_SECRET})
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"GET {path} failed: {e}")
        return None

def api_patch(path, data):
    """Make a PATCH request to the backend (used to update order status)."""
    url  = BACKEND_URL + path
    body = json.dumps(data).encode("utf-8")
    req  = urllib.request.Request(
        url,
        data=body,
        method="PATCH",
        headers={
            "Content-Type": "application/json",
            "x-robot-secret": ROBOT_SECRET,
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"PATCH {path} failed: {e}")
        return None

# ── Main loop ──────────────────────────────────────────────────────────────────

def main():
    # Import ev3dev2 here so the rest of the file can be read on a regular
    # computer without crashing (useful for editing the code on your Mac).
    try:
        from ev3dev2.motor import LargeMotor, OUTPUT_B, OUTPUT_C
        left_motor  = LargeMotor(OUTPUT_B)
        right_motor = LargeMotor(OUTPUT_C)
        motors = (left_motor, right_motor)
        print("✅ Motors connected.")
    except ImportError:
        print("⚠️  ev3dev2 not found — running in simulation mode (no motors).")
        motors = None

    print(f"🤖 Robot ready. Polling {BACKEND_URL} every {POLL_INTERVAL}s...")

    while True:
        # Ask the server: "any new orders for me?"
        result = api_get("/orders/pending")

        if result and result.get("order"):
            order = result["order"]
            room  = order["room"]
            item  = order["item"]
            oid   = order["id"]

            print(f"\n📦 Order #{oid}: '{item}' → {room}")

            # Tell the server we're on our way
            api_patch(f"/orders/{oid}/status", {"status": "delivering"})

            # Drive to the room
            route_fn = ROOM_ROUTES.get(room)
            if route_fn and motors:
                route_fn(motors)
                stop(motors)
            elif not motors:
                print(f"[Simulation] Would drive to {room}")
                time.sleep(2)  # pretend it took 2 seconds
            else:
                print(f"⚠️  No route defined for '{room}'")

            # Tell the server we're done
            api_patch(f"/orders/{oid}/status", {"status": "delivered"})
            print(f"✅ Order #{oid} delivered!\n")

        # Wait before polling again
        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()
