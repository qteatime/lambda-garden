# meow.time

Deals with dates, points in time, and durations. Largely based on JavaScript's
Temporal API, but currently lacking support for calendars and stuff.

Date and time is a complicated topic because most of it is culturally defined,
and varies wildly between cultures. Dates and times may even change on a whim
because some government decides to add or remove offsets from it, so it's a
proper algorithimic view of it will never be possible. Be sure to read the
Temporal API documentation to understand these aspects.

## This package

We provide the following main types:

- instant: used to represent a fixed point in time, disregarding any notion
  of calendars, time-zones, and other cultural aspects of dates. Think of it
  as a rich sort of "UTC timestamp";

- plain-date-time: an instant in UTC date time using the Gregorian calendar.
  Has no concept of time zones.

- duration: a specific amount of time, such as "3 days" or "56 hours". Note
  that time durations cannot be mixed with date durations, and date durations
  are not balanceable without a calendar (e.g.: there's no absolute concept of
  what "3 weeks + 2 days" means).

## Constructing instants

You can construct an instant from a ISO-formatted UTC date-time or from
the a timestamp using the Unix epoch (1970-01-01 00:00 UTC). The following
construct the same date:

    #instant from-iso8601("2021-12-23T18:00:00.000Z");

    #instant from-epoch(milliseconds: 1_640_282_400_000);

You can also construct an instant from the computer's wall clock, as long
as you have a wall-clock capability:

    wall-clock now;

## Constructing Gregorian date-times

You can convert instants to a plain-date-time to work with that instant
in the Gregorian calendar.

    #instant
      from-epoch(milliseconds: 1_640_282_400_000)
      as plain-date-time;

## Constructing durations

You can construct a duration by casting numbers to one of the duration
units, or by using the numeric extension methods:

    (3 as days) + (15 as minutes) + (50 as seconds);
    // is equivalent to:
    3 days() + 15 minutes() + 50 seconds();

And you can use them to operate _on instants_:

    #instant from-iso8601("2021-12-23T18:00:00.000Z")
      + 3 days() + 50 seconds();

This gives you:

    #instant from-iso8601("2021-12-26T18:00:50.000Z");

Note that when operating a duration of `3 days + 15 minutes` represents
**exactly 3 days and 15 minutes (separately)**, it does not stand for
`4_335 minutes` because timezones can affect how long or short a day is
in terms of time.

You can, however, balance a duration to convert between units if you need
`3 days + 15 minutes` in seconds or similar, but in this case you'll need
to provide a calendar and point in time for reference whenever dates are
involved.
