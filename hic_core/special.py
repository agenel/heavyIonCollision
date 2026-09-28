"""Numpy-only special functions (Blender's Python has no scipy).

- gammainc_upper_reg(a, x): regularized upper incomplete gamma Q(a, x) (NR 6.2, series + Lentz CF).
- bessel_i0, bessel_i1, bessel_k0, bessel_k1: Abramowitz & Stegun 9.8.1-9.8.8 polynomial fits (|err| < 2e-7 rel).
"""
import numpy as np


def _gammaln(a):
    return np.vectorize(lambda v: float(np.math.lgamma(v)) if hasattr(np, "math") else __import__("math").lgamma(v))(a)


def gammainc_upper_reg(a, x, n_iter=200):
    """Q(a, x) = Gamma(a, x)/Gamma(a), vectorized in x for scalar a > 0."""
    import math
    x = np.asarray(x, float)
    a = float(a)
    gln = math.lgamma(a)
    out = np.empty_like(x)
    use_series = x < a + 1.0
    # series for P(a,x)
    xs = x[use_series]
    if xs.size:
        ap = a; s = np.full_like(xs, 1.0 / a); d = np.full_like(xs, 1.0 / a)
        for _ in range(n_iter):
            ap += 1.0
            d = d * xs / ap
            s = s + d
        P = s * np.exp(-xs + a * np.log(np.maximum(xs, 1e-300)) - gln)
        P = np.where(xs <= 0, 0.0, P)
        out[use_series] = 1.0 - P
    # continued fraction (modified Lentz) for Q(a,x)
    xc = x[~use_series]
    if xc.size:
        tiny = 1e-300
        b = xc + 1.0 - a; c = np.full_like(xc, 1.0 / tiny); d = 1.0 / b; h = d.copy()
        for i in range(1, n_iter + 1):
            an = -i * (i - a)
            b = b + 2.0
            d = an * d + b; d = np.where(np.abs(d) < tiny, tiny, d)
            c = b + an / c; c = np.where(np.abs(c) < tiny, tiny, c)
            d = 1.0 / d
            h = h * d * c
        out[~use_series] = np.exp(-xc + a * np.log(xc) - gln) * h
    return np.clip(out, 0.0, 1.0)


def bessel_i0(x):
    x = np.asarray(x, float); ax = np.abs(x)
    t = (ax / 3.75) ** 2
    small = 1 + t * (3.5156229 + t * (3.0899424 + t * (1.2067492 + t * (0.2659732 + t * (0.0360768 + t * 0.0045813)))))
    y = 3.75 / np.maximum(ax, 1e-300)
    big = (np.exp(ax) / np.sqrt(np.maximum(ax, 1e-300))) * (0.39894228 + y * (0.01328592 + y * (0.00225319 + y * (-0.00157565 + y * (0.00916281 + y * (-0.02057706 + y * (0.02635537 + y * (-0.01647633 + y * 0.00392377))))))))
    return np.where(ax < 3.75, small, big)


def bessel_i1(x):
    x = np.asarray(x, float); ax = np.abs(x)
    t = (ax / 3.75) ** 2
    small = ax * (0.5 + t * (0.87890594 + t * (0.51498869 + t * (0.15084934 + t * (0.02658733 + t * (0.00301532 + t * 0.00032411))))))
    y = 3.75 / np.maximum(ax, 1e-300)
    big = (np.exp(ax) / np.sqrt(np.maximum(ax, 1e-300))) * (0.39894228 + y * (-0.03988024 + y * (-0.00362018 + y * (0.00163801 + y * (-0.01031555 + y * (0.02282967 + y * (-0.02895312 + y * (0.01787654 - y * 0.00420059))))))))
    r = np.where(ax < 3.75, small, big)
    return np.where(x < 0, -r, r)


def bessel_k0(x):
    x = np.asarray(x, float); x = np.maximum(x, 1e-300)
    t = x / 2.0
    small = (-np.log(t) * bessel_i0(x)) + (-0.57721566 + t**2 * (0.42278420 + t**2 * (0.23069756 + t**2 * (0.03488590 + t**2 * (0.00262698 + t**2 * (0.00010750 + t**2 * 0.0000074))))))
    y = 2.0 / x
    big = (np.exp(-x) / np.sqrt(x)) * (1.25331414 + y * (-0.07832358 + y * (0.02189568 + y * (-0.01062446 + y * (0.00587872 + y * (-0.00251540 + y * 0.00053208))))))
    return np.where(x <= 2.0, small, big)


def bessel_k1(x):
    x = np.asarray(x, float); x = np.maximum(x, 1e-300)
    t = x / 2.0
    small = (np.log(t) * bessel_i1(x)) + (1.0 / x) * (1.0 + t**2 * (0.15443144 + t**2 * (-0.67278579 + t**2 * (-0.18156897 + t**2 * (-0.01919402 + t**2 * (-0.00110404 - t**2 * 0.00004686))))))
    y = 2.0 / x
    big = (np.exp(-x) / np.sqrt(x)) * (1.25331414 + y * (0.23498619 + y * (-0.03655620 + y * (0.01504268 + y * (-0.00780353 + y * (0.00325614 - y * 0.00068245))))))
    return np.where(x <= 2.0, small, big)
